from .base import ProviderClient

_NOT_IMPLEMENTED = (
    "Real NHS integration requires a registered NHS digital partnership and OAuth2 "
    "credentials. This class is the seam where that implementation goes; the rest "
    "of the app already depends only on the ProviderClient interface."
)


class NHSProviderClient(ProviderClient):
    def initiate_oauth(self, link_account) -> dict:
        raise NotImplementedError(_NOT_IMPLEMENTED)

    def handle_callback(self, link_account) -> None:
        raise NotImplementedError(_NOT_IMPLEMENTED)

    def fetch_appointments(self, link_account) -> list[dict]:
        raise NotImplementedError(_NOT_IMPLEMENTED)

    def fetch_records(self, link_account) -> list[dict]:
        raise NotImplementedError(_NOT_IMPLEMENTED)
