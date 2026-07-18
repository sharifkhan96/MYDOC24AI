from abc import ABC, abstractmethod


class ProviderClient(ABC):
    """Interface a real NHS or Medicaid OAuth integration would implement.

    Swapping from the mock to a real partnership integration means writing a
    new class against this same interface and pointing the registry at it.
    The rest of the app (models, views, frontend) does not need to change.
    """

    @abstractmethod
    def initiate_oauth(self, link_account) -> dict:
        """Start the consent/authorization flow. Returns whatever the caller needs
        to redirect the user (a real client would return an authorization URL)."""

    @abstractmethod
    def handle_callback(self, link_account) -> None:
        """Complete the flow after the user grants consent."""

    @abstractmethod
    def fetch_appointments(self, link_account) -> list[dict]:
        ...

    @abstractmethod
    def fetch_records(self, link_account) -> list[dict]:
        ...
