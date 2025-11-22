import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PersonalizeMessageParams {
  eventName: string;
  eventType: string;
  guestFirstName: string;
  relationship?: string;
  tone?: "warm_casual" | "polite_formal" | "playful";
  context?: string;
  organizerName: string;
}

export async function personalizeMessage(
  params: PersonalizeMessageParams
): Promise<string> {
  const {
    eventName,
    eventType,
    guestFirstName,
    relationship = "acquaintance",
    tone = "warm_casual",
    context = "",
    organizerName,
  } = params;

  const toneDescriptions = {
    warm_casual: "warm and casual, like texting a friend",
    polite_formal: "polite and professional, but still friendly",
    playful: "playful and fun, with a lighthearted vibe",
  };

  const prompt = `You are helping someone request a mailing address for their ${eventType}.

Context:
- Event: ${eventName}
- Recipient's first name: ${guestFirstName}
- Organizer's name: ${organizerName}
- Guest relationship: ${relationship}
- Desired tone: ${toneDescriptions[tone]}
${context ? `- Additional context: ${context}` : ""}

Generate a brief, natural message (1-2 sentences max) asking ${guestFirstName} for their mailing address.
The message should:
1. Sound human and personal, not robotic or automated
2. Match the ${tone.replace("_", " ")} tone exactly
3. Include that there will be a link to submit (use placeholder [link])
4. Be conversational and appropriate for the relationship

Bad example (too formal): "I am writing to request your current mailing address for the purpose of sending an invitation."
Good example (warm_casual): "Hey ${guestFirstName}! ${organizerName} and I are planning ${eventName} and need your address to send you an invitation. Quick form here: [link]"

Generate ONLY the message text, no explanation or quotes.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageText = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    return messageText.trim();
  } catch (error) {
    console.error("Claude API error:", error);
    // Fallback to template if AI fails
    return `Hi ${guestFirstName}! I need your mailing address for ${eventName}. Could you share it here? [link] Thanks!`;
  }
}

export async function generateReminderMessage(
  originalMessage: string,
  reminderNumber: number,
  daysSinceLastContact: number,
  guestFirstName: string
): Promise<string> {
  const prompt = `Generate a friendly reminder message based on this original request:

Original: "${originalMessage}"

This is reminder #${reminderNumber}, sent ${daysSinceLastContact} days after the last message.
Guest's name: ${guestFirstName}

Create a varied follow-up message that:
1. Sounds different from the original (not just "following up")
2. Maintains a friendly, non-pushy tone
3. Gets slightly more urgent as reminder number increases
4. Includes [link] placeholder
5. Is 1-2 sentences max

Generate ONLY the reminder text, no explanation.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const messageText = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    return messageText.trim();
  } catch (error) {
    console.error("Claude API error:", error);
    return `Hi ${guestFirstName}! Just a gentle reminder - we still need your mailing address: [link]`;
  }
}
