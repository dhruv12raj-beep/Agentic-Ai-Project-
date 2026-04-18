import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD

def send_email(to: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_USER
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USER, to, msg.as_string())

def resolution_email(customer_email: str, subject: str, resolution: str):
    body = f"""
    <h2>Your support ticket has been resolved</h2>
    <p><strong>Subject:</strong> {subject}</p>
    <p><strong>Resolution:</strong></p>
    <p>{resolution}</p>
    <br>
    <p>If you have further concerns, please raise a new ticket.</p>
    <p>— Support Team</p>
    """
    send_email(customer_email, f"Resolved: {subject}", body)

def escalation_email(department_email: str, ticket_id: str, subject: str, description: str, reason: str, priority: str):
    body = f"""
    <h2>New ticket escalated to your department</h2>
    <p><strong>Ticket ID:</strong> {ticket_id}</p>
    <p><strong>Subject:</strong> {subject}</p>
    <p><strong>Priority:</strong> {priority}</p>
    <p><strong>Description:</strong></p>
    <p>{description}</p>
    <p><strong>Reason for escalation:</strong></p>
    <p>{reason}</p>
    <br>
    <p>Please log in to the executive portal to handle this ticket.</p>
    <p>— AI Support Agent</p>
    """
    send_email(department_email, f"[{priority.upper()}] Escalated Ticket: {subject}", body)