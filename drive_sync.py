import io
import json
import os
import time
from datetime import datetime, timezone

from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
FOLDER_ID = '15rw5yo86Pkx7I_aaJ-8UGEWn6bD9wMo5'
IMAGES_DIR = 'images'
TOKEN_FILE = 'token.json'
CHECK_INTERVAL_SECONDS = 300


def log(message):
    ts = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')
    print(f"[{ts}] {message}", flush=True)


def maybe_write_token_from_env():
    """Allow headless environments (Render) to provide token JSON via env var."""
    token_json = os.getenv('GOOGLE_OAUTH_TOKEN_JSON', '').strip()
    if token_json and not os.path.exists(TOKEN_FILE):
        parsed = json.loads(token_json)
        with open(TOKEN_FILE, 'w', encoding='utf-8') as token_file:
            json.dump(parsed, token_file)
        log('Wrote token.json from GOOGLE_OAUTH_TOKEN_JSON environment variable.')


def authenticate():
    maybe_write_token_from_env()

    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds:
        raise RuntimeError(
            'No token.json found. In Render, set GOOGLE_OAUTH_TOKEN_JSON with the full token JSON from your local machine.'
        )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_FILE, 'w', encoding='utf-8') as token_file:
            token_file.write(creds.to_json())
        log('Refreshed OAuth token and updated token.json.')

    if not creds.valid:
        raise RuntimeError('OAuth credentials are invalid and could not be refreshed.')

    return creds


def download_new_images(service):
    results = service.files().list(
        q=f"'{FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false",
        spaces='drive',
        fields="files(id, name, mimeType, modifiedTime)").execute()
    items = results.get('files', [])
    if not os.path.exists(IMAGES_DIR):
        os.makedirs(IMAGES_DIR)

    downloaded_count = 0
    for item in items:
        local_path = os.path.join(IMAGES_DIR, item['name'])
        if not os.path.exists(local_path):
            log(f"Downloading {item['name']}...")
            request = service.files().get_media(fileId=item['id'])
            fh = io.FileIO(local_path, 'wb')
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            downloaded_count += 1
            log(f"Downloaded {item['name']} to {local_path}")

    return len(items), downloaded_count


def main():
    log('Starting Google Drive sync worker...')
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    while True:
        try:
            total_items, downloaded = download_new_images(service)
            log(
                f"Check complete: {total_items} image(s) in Drive folder, {downloaded} new file(s) downloaded. "
                f"Sleeping {CHECK_INTERVAL_SECONDS} seconds."
            )
        except Exception as exc:
            # Keep process alive so Render doesn't thrash-restart forever.
            log(f"Sync error: {exc}. Retrying in {CHECK_INTERVAL_SECONDS} seconds.")
        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == '__main__':
    main()
