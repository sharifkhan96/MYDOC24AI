import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FileText, Link2, ShieldCheck } from "lucide-react";
import { useState } from "react";

import {
  confirmConsent,
  connectProvider,
  disconnectProvider,
  getAppointments,
  getRecords,
  listProviderLinks,
  type ProviderCode,
} from "@/api/integrations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

const PROVIDER_META: Record<ProviderCode, { name: string; description: string }> = {
  nhs: { name: "NHS", description: "Connect your NHS account to see appointments and records here." },
  medicaid: { name: "Medicaid", description: "Connect your Medicaid account to see appointments and records here." },
};

function ProviderDashboard({ provider }: { provider: ProviderCode }) {
  const { data: appointments = [] } = useQuery({ queryKey: ["appointments", provider], queryFn: () => getAppointments(provider) });
  const { data: records = [] } = useQuery({ queryKey: ["records", provider], queryFn: () => getRecords(provider) });

  return (
    <div className="mt-4 space-y-4">
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy-700">
          <CalendarDays className="h-4 w-4" /> Appointments
        </h4>
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a.id} className="rounded-lg border border-navy-100 px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-navy-700">{a.title}</span>
                <Badge tone={a.status === "upcoming" ? "soon" : "neutral"}>{a.status}</Badge>
              </div>
              <p className="text-navy-400">
                {a.clinician_name} · {a.location} · {new Date(a.scheduled_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-navy-700">
          <FileText className="h-4 w-4" /> Records
        </h4>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="rounded-lg border border-navy-100 px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-navy-700">{r.title}</span>
                <span className="text-navy-400">{r.record_date}</span>
              </div>
              <p className="text-navy-600">{r.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConnectionsPage() {
  const queryClient = useQueryClient();
  const { data: links = [] } = useQuery({ queryKey: ["provider-links"], queryFn: listProviderLinks });
  const [consentProvider, setConsentProvider] = useState<ProviderCode | null>(null);
  const [consentScopes, setConsentScopes] = useState<string[]>([]);

  async function handleConnect(provider: ProviderCode) {
    const { consent_scopes } = await connectProvider(provider);
    setConsentScopes(consent_scopes);
    setConsentProvider(provider);
  }

  async function handleConfirm() {
    if (!consentProvider) return;
    await confirmConsent(consentProvider);
    setConsentProvider(null);
    queryClient.invalidateQueries({ queryKey: ["provider-links"] });
  }

  async function handleDisconnect(provider: ProviderCode) {
    await disconnectProvider(provider);
    queryClient.invalidateQueries({ queryKey: ["provider-links"] });
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Connections</h1>
      <p className="mb-6 text-navy-400">
        Securely link a real healthcare account to see appointments and records in one place.
      </p>

      <div className="space-y-4">
        {links.map((link) => (
          <Card key={link.provider}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-sage-600" />
                <div>
                  <CardTitle>{PROVIDER_META[link.provider].name}</CardTitle>
                  <CardDescription>{PROVIDER_META[link.provider].description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {link.status === "connected" && <Badge tone="home">Connected</Badge>}
                {link.status === "not_connected" && (
                  <Button size="sm" onClick={() => handleConnect(link.provider)}>
                    Connect
                  </Button>
                )}
                {link.status === "connected" && (
                  <Button size="sm" variant="secondary" onClick={() => handleDisconnect(link.provider)}>
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
            {link.status === "connected" && <ProviderDashboard provider={link.provider} />}
          </Card>
        ))}
      </div>

      <Modal
        open={!!consentProvider}
        onOpenChange={(open) => !open && setConsentProvider(null)}
        title={`Connect your ${consentProvider ? PROVIDER_META[consentProvider].name : ""} account`}
      >
        <div className="space-y-4">
          <p className="text-sm text-navy-600">
            This is a demo integration. In a real deployment, you'd be redirected to sign in securely and grant
            access. Here, confirming below simulates that consent and populates sample data.
          </p>
          <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-navy-700">
              <ShieldCheck className="h-4 w-4" /> MyDoc24 would be able to see:
            </p>
            <ul className="list-inside list-disc text-sm text-navy-600">
              {consentScopes.map((s) => (
                <li key={s} className="capitalize">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Button className="w-full" onClick={handleConfirm}>
            I consent, connect my account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
