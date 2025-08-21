from minio import Minio
import base64
import io
import uuid
import os


def upload_base64_image_to_minio(base64_str, object_name=None, folder=None, bucket=None): 
    # MinIO client setup (edit with your MinIO credentials)
    minio_client = Minio(
        os.getenv("MINIO_URL"),  # Change to your MinIO endpoint
        access_key=os.getenv("MINIO_CLIENT"),  # Change to your access key
        secret_key=os.getenv("MINIO_SECRET"),  # Change to your secret key
        secure=False
    )

    bucket_name = "public" 
    default_folder = "images"  

    # Ensure bucket exists
    found = minio_client.bucket_exists(bucket_name)
    if not found:
        minio_client.make_bucket(bucket_name)

    if not object_name:
        object_name = f"logo_{uuid.uuid4().hex}.png"
    if folder is None:
        folder = default_folder
    if bucket is None:
        bucket = bucket_name
    # Compose object path with folder
    object_path = f"{folder}/{object_name}" if folder else object_name
    # Remove base64 header if present
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    image_data = base64.b64decode(base64_str)
    image_bytes = io.BytesIO(image_data)
    minio_client.put_object(
        bucket,
        object_path,
        image_bytes,
        length=len(image_data),
        content_type="image/png"
    )
    return {
        "url": f"{os.getenv('MINIO_URL')}/{bucket}/{object_path}",
        "object_name": object_name,
        "folder": folder,
        "bucket": bucket,
        "presigned_url": minio_client.presigned_get_object(bucket, object_path)
    }
