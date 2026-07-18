# MyDoc24.ai: Product Description

## What this is

MyDoc24.ai is a health companion platform that puts a knowledgeable, calm, and trustworthy doctor in everyone's pocket. It combines AI reasoning, medical image and lab report review, spoken conversation with a lifelike doctor or nurse character, and secure links into real healthcare systems like the NHS and Medicaid. The product should feel like a private clinic, not a chatbot demo: quiet confidence, clean typography, restrained color, and language that respects the seriousness of health decisions.

The site is aimed at everyday people who want a fast, private, well-informed first opinion on a symptom, a photo of a rash, a lab result, a medication, or a general question about staying healthy. It is not a replacement for licensed medical care, and the product should say so plainly and often, without being alarmist about it.

## Design direction

Elegant and clinical rather than playful. Think of the visual language of a well-designed private hospital or a premium health insurer: generous white space, a restrained palette (deep navy or forest green as primary, warm off-white background, one accent color used sparingly), serif or humanist sans headers, and photography or illustration that favors real human warmth over stock-photo gloss. Avoid gradients-on-everything, glowing neon accents, cartoon mascots, or anything that reads as a hackathon project. Micro-interactions should be subtle: soft transitions, not bouncy animations.

Every screen should communicate competence and calm. A user arriving worried about a symptom should feel like they've walked into a well-run practice, not a novelty app.

## Core features

### 1. Symptom advice and basic to intermediate diagnosis

A conversational intake where the user describes what's wrong in their own words, or answers a short structured set of follow-up questions (onset, severity, duration, associated symptoms, existing conditions, medications). The system produces a plain-language assessment: likely causes ranked by probability, a clear statement of what would warrant urgent in-person care, and suggested next steps. It should distinguish clearly between "this is likely minor and manageable at home" and "this needs a doctor within 24 hours" and "this needs emergency care now."

### 2. Image and test upload analysis

Users can upload a photo (skin condition, wound, rash, eye, swelling) or a document (blood test, X-ray report, prescription, discharge summary) and get a structured read-back: what the values or visual findings suggest, what's within normal range, what's worth flagging to a doctor, and what it is not able to determine from the image or document alone. The tone should always include the limits of image-based assessment and encourage confirmation by a clinician when stakes are higher than routine.

### 3. Medication information

A lookup and explanation module covering what a medicine is for, typical adult and pediatric dosing, how and when to take it, food or alcohol interactions, common and serious side effects, what to do if a dose is missed, and interaction warnings against other medications or conditions the user has already told the platform about. This should read like a well-written patient information leaflet, not a wall of pharmacology jargon.

### 4. Live voice and face-to-face AI consultation

The centerpiece feature. When the user starts a live session, they choose a persona: doctor or nurse, male or female voice, and can pick a visual style for the character. The character speaks with a natural, warm, unhurried voice (ElevenLabs or comparable text-to-speech, tuned for warmth and pacing rather than speed) and appears as an animated face or avatar that reacts naturally while listening and speaking. The conversation should feel like a real consultation: the character asks clarifying questions, pauses to let the user finish, and summarizes what it heard before giving guidance. Sessions should support both voice-only and a video-call-style interface with the character's face visible.

### 5. Chat modes: temporary and permanent

Users can start a temporary session that is not stored and disappears when closed, useful for a sensitive or one-off question. Permanent chats are saved to the user's account, organized by date or topic, and can be revisited later so the user's health history builds up over time and future conversations can reference it ("last time you mentioned...").

### 6. Personal health history and prevention

The platform keeps a private record of conditions the user has previously had, allergies, ongoing medications, and family history if provided. From this it can proactively suggest how to stay healthy given a past condition (for example, post-recovery guidance after a specific illness), how to reduce risk of a condition the user is concerned about, and reminders tied to known risk factors.

### 7. Trending diseases and public health awareness

A regularly updated section covering diseases currently active or rising in the user's region or globally, what the symptoms look like, how they spread, and practical steps to reduce risk. This should read like a trustworthy public health bulletin rather than clickbait.

### 8. Disease encyclopedia

A reference library covering the history of major diseases, how deadly or mild they are in context, how treatment has evolved, and current outlook. Written for a curious layperson, not a medical textbook, but accurate and sourced.

### 9. Lifestyle assessment

A short questionnaire on diet, sleep, activity, stress, and habits like smoking or alcohol, producing a plain assessment of what's working and what isn't, with specific, realistic suggestions rather than generic wellness advice. If the lifestyle picture is already healthy, the platform should say so and suggest fine-tuning rather than manufacturing problems.

### 10. Beauty and general wellbeing

Coverage extends beyond acute illness into skin care, hair, nutrition, and general wellbeing questions, treated with the same evidence-based tone as clinical topics rather than as a separate lifestyle-blog voice.

### 11. Connection to real healthcare systems

Secure account linking to services such as the NHS app, Medicaid, or comparable regional systems, allowing the user to see appointment status, book or manage appointments, and view updates from their actual provider without leaving the platform. This is the feature with the highest security and compliance bar and needs OAuth-based linking, no storage of third-party credentials, and clear user consent screens explaining exactly what is shared.

## AI backend

The platform draws on multiple large language model providers, OpenAI, Anthropic Claude, and Google Gemini, routing each type of request to whichever model handles it best: for instance, one model for careful medical reasoning, another for image analysis, another for natural conversational voice interaction. This should be invisible to the user; they experience one coherent doctor, not a patchwork of vendors. Model selection and prompt design should consistently favor caution, cite uncertainty honestly, and default to recommending professional care whenever a case is ambiguous or serious.

## Trust, safety, and compliance

Every clinical output carries a clear, unobtrusive reminder that this is informational guidance, not a diagnosis from a licensed physician, and that emergencies should go to emergency services immediately. Health data handling needs to meet the bar of relevant regulation for wherever the user is (HIPAA in the US, UK GDPR and NHS data standards in the UK), with encryption at rest and in transit, clear data deletion controls, and no sharing of personal health data with third parties beyond what the user explicitly authorizes for provider integrations. Persona voice and image generation should avoid impersonating any real clinician and should be clearly presented as an AI character throughout, even while sounding natural.

## What "for now" means

At this stage the deliverable is the website itself: the structure, the pages, the design system, and the interaction flows for the features above, built so that the AI backend and voice integration can be wired in as the next phase. The written description above is the brief to build against.
