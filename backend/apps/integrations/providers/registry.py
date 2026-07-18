from .mock_provider import MockProviderClient

# Every provider currently runs in mock mode. To go live for a given provider,
# implement its real client against ProviderClient (see nhs_provider.py and
# medicaid_provider.py) and swap its entry here. Everything upstream
# (models, views, frontend) already talks to the ProviderClient interface.
_REGISTRY = {
    "nhs": MockProviderClient,
    "medicaid": MockProviderClient,
}


def get_provider_client(provider: str) -> object:
    return _REGISTRY[provider]()
