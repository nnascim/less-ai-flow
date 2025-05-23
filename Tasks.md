# Tasks

## Send AI generated Tweet drafts to an email list for approval.

- Create a function to communicate with LLM.
  - Use `openrouter.ai` API.
- Create a function to send emails. Documentation: https://www.twilio.com/docs/sendgrid/api-reference/mail-send/mail-send
- Create a function to send AI Tweet drafts to an email list.
- Trigger job to send 5 Tweet drafts to an email list.
  - Triggered by a daily cron job: `./less/crons/propose_tweets`.
    - Create a command using pub/sub for the job: `./less/topics/send_email_command/process`.
      - Save proposals to KVS with a TTL of 24 hours. The UUID key will be used in the email links to approve proposals.

### Email content

- Add proposal id to the reply-to address. E.g. `ai-tweeter+{proposal_id}@chuva.io`.
- Display a numbered list of Tweet drafts.
- Include a link to approve the Tweet `GET /proposals/{proposal_id}/proposal_number/{proposal_number}`.
  - Delete the proposal from KVS.
  - Send confirmation email to the user.

## Handle email edit requests

- Listen for email responses in the thread.
  - Use Sendgrid's Inbound Parse feature
- Make edit according to the email message.
- Send updated proposal to the user.
