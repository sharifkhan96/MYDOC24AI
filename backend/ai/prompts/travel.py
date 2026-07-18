from . import SAFETY_PREAMBLE

DESTINATION_TYPE_LABELS = {
    "cold": "a cold or snowy destination",
    "hot_desert": "a hot, desert-like destination",
    "beach_tropical": "a beach or tropical destination",
    "cruise": "a cruise",
    "forest_jungle": "a forest or jungle destination",
    "high_altitude": "a mountain or high-altitude destination",
    "urban_city": "an urban city destination",
}


def build_travel_advisory_prompt(destination_type: str, destination_name: str) -> tuple[str, str]:
    system = SAFETY_PREAMBLE + (
        "\n\nYou are giving general travel health guidance, not real-time outbreak data. "
        "Cover, in plain warm language: common health risks for this kind of environment, "
        "practical precautions (clothing, hydration, sun/altitude/motion considerations as "
        "relevant), what to pack for health reasons, and when to see a travel clinic before "
        "departure (vaccines, prescriptions). Keep it concrete and specific to the "
        "environment described, not generic. Four to six short paragraphs or a tight list, "
        "plain spoken language."
    )
    place = DESTINATION_TYPE_LABELS.get(destination_type, "this kind of destination")
    if destination_name:
        user = f"I'm planning a trip to {destination_name}, which is {place}. What should I know to stay safe and healthy?"
    else:
        user = f"I'm planning a trip to {place}. What should I know to stay safe and healthy?"
    return system, user
