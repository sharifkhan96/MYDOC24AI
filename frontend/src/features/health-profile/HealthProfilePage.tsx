import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import {
  allergiesApi,
  conditionsApi,
  familyHistoryApi,
  personalMedicationsApi,
  type Allergy,
  type Condition,
  type FamilyHistoryEntry,
  type PersonalMedication,
} from "@/api/healthProfile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

function Row({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-4 py-2.5">
      <div className="text-sm text-navy-700">{children}</div>
      <button onClick={onRemove} aria-label="Remove" className="text-navy-400 hover:text-urgent-emergency">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConditionsSection() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["conditions"], queryFn: conditionsApi.list });
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Condition["status"]>("ongoing");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await conditionsApi.create({ name, status });
    setName("");
    queryClient.invalidateQueries({ queryKey: ["conditions"] });
  }

  async function handleRemove(id: number) {
    await conditionsApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ["conditions"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions</CardTitle>
        <CardDescription>Past or ongoing conditions we should keep in mind.</CardDescription>
      </CardHeader>
      <div className="mb-3 space-y-2">
        {items.map((c) => (
          <Row key={c.id} onRemove={() => handleRemove(c.id)}>
            <span className="font-medium">{c.name}</span>{" "}
            <Badge tone={c.status === "ongoing" ? "soon" : "neutral"} className="ml-1">
              {c.status}
            </Badge>
          </Row>
        ))}
        {items.length === 0 && <p className="text-sm text-navy-400">Nothing added yet.</p>}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Asthma"
          className="flex-1 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Condition["status"])}
          className="rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-2 py-2 text-sm focus:border-navy-400 focus:outline-none"
        >
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
        </select>
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

function AllergiesSection() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["allergies"], queryFn: allergiesApi.list });
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<Allergy["severity"]>("mild");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!allergen.trim()) return;
    await allergiesApi.create({ allergen, severity });
    setAllergen("");
    queryClient.invalidateQueries({ queryKey: ["allergies"] });
  }

  async function handleRemove(id: number) {
    await allergiesApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ["allergies"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergies</CardTitle>
        <CardDescription>Anything you react to, and how severe it is.</CardDescription>
      </CardHeader>
      <div className="mb-3 space-y-2">
        {items.map((a) => (
          <Row key={a.id} onRemove={() => handleRemove(a.id)}>
            <span className="font-medium">{a.allergen}</span>{" "}
            <Badge tone={a.severity === "severe" ? "emergency" : a.severity === "moderate" ? "soon" : "neutral"} className="ml-1">
              {a.severity}
            </Badge>
          </Row>
        ))}
        {items.length === 0 && <p className="text-sm text-navy-400">Nothing added yet.</p>}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={allergen}
          onChange={(e) => setAllergen(e.target.value)}
          placeholder="e.g. Penicillin"
          className="flex-1 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Allergy["severity"])}
          className="rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-2 py-2 text-sm focus:border-navy-400 focus:outline-none"
        >
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

function MedicationsSection() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["personal-medications"], queryFn: personalMedicationsApi.list });
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await personalMedicationsApi.create({ name, dosage, is_active: true });
    setName("");
    setDosage("");
    queryClient.invalidateQueries({ queryKey: ["personal-medications"] });
  }

  async function handleRemove(id: number) {
    await personalMedicationsApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ["personal-medications"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your medications</CardTitle>
        <CardDescription>What you're currently taking.</CardDescription>
      </CardHeader>
      <div className="mb-3 space-y-2">
        {items.map((m: PersonalMedication) => (
          <Row key={m.id} onRemove={() => handleRemove(m.id)}>
            <span className="font-medium">{m.name}</span>
            {m.dosage && <span className="text-navy-400"> · {m.dosage}</span>}
          </Row>
        ))}
        {items.length === 0 && <p className="text-sm text-navy-400">Nothing added yet.</p>}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Metformin"
          className="flex-1 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Dosage"
          className="w-28 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

function FamilyHistorySection() {
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["family-history"], queryFn: familyHistoryApi.list });
  const [relation, setRelation] = useState("");
  const [condition, setCondition] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!relation.trim() || !condition.trim()) return;
    await familyHistoryApi.create({ relation, condition });
    setRelation("");
    setCondition("");
    queryClient.invalidateQueries({ queryKey: ["family-history"] });
  }

  async function handleRemove(id: number) {
    await familyHistoryApi.remove(id);
    queryClient.invalidateQueries({ queryKey: ["family-history"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family history</CardTitle>
        <CardDescription>Conditions that run in your family.</CardDescription>
      </CardHeader>
      <div className="mb-3 space-y-2">
        {items.map((f: FamilyHistoryEntry) => (
          <Row key={f.id} onRemove={() => handleRemove(f.id)}>
            <span className="font-medium">{f.relation}</span>
            <span className="text-navy-400"> · {f.condition}</span>
          </Row>
        ))}
        {items.length === 0 && <p className="text-sm text-navy-400">Nothing added yet.</p>}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          placeholder="e.g. Mother"
          className="w-28 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <input
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="e.g. Type 2 diabetes"
          className="flex-1 rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
        />
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

export function HealthProfilePage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Health profile</h1>
      <p className="mb-6 text-navy-400">
        This shapes the advice you get elsewhere in MyDoc24, and is only visible to you.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConditionsSection />
        <AllergiesSection />
        <MedicationsSection />
        <FamilyHistorySection />
      </div>
    </div>
  );
}
