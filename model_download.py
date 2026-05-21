import os
from huggingface_hub import snapshot_download

def download_local_model():
    repo_id = "sentence-transformers/all-MiniLM-L6-v2"
    local_dir = os.path.join(os.getcwd(), "model", "all-MiniLM-L6-v2")
    
    print(f"Starting download of '{repo_id}'...")
    print(f"Target location: {local_dir}\n")
    
    snapshot_download(
        repo_id=repo_id,
        local_dir=local_dir,
        local_dir_use_symlinks=False
      )
    
    print("\nDownload complete! All files saved successfully.")

if __name__ == "__main__":
    download_local_model()