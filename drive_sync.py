import os
import io
import time
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# If modifying these SCOPES, delete the token.json file.
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Set your folder ID and local images directory
FOLDER_ID = '15rw5yo86Pkx7I_aaJ-8UGEWn6bD9wMo5'
IMAGES_DIR = 'images'

def authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def download_new_images(service):
    results = service.files().list(
        q=f"'{FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false",
        spaces='drive',
        fields="files(id, name, mimeType, modifiedTime)").execute()
    items = results.get('files', [])
    if not os.path.exists(IMAGES_DIR):
        os.makedirs(IMAGES_DIR)
    for item in items:
        local_path = os.path.join(IMAGES_DIR, item['name'])
        if not os.path.exists(local_path):
            print(f"Downloading {item['name']}...")
            request = service.files().get_media(fileId=item['id'])
            fh = io.FileIO(local_path, 'wb')
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
            print(f"Downloaded {item['name']} to {local_path}")

def main():
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)
    while True:
        download_new_images(service)
        print("Checked for new images. Sleeping for 5 minutes...")
        time.sleep(300)  # Check every 5 minutes

if __name__ == '__main__':
    main()
