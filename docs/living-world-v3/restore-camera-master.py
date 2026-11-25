from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
metadata=json.loads((root/'camera-master.json').read_text())
parts=[]
for entry in metadata['parts']:
    data=(root/entry['name']).read_bytes()
    assert len(data)==entry['bytes'] and hashlib.sha256(data).hexdigest()==entry['sha256']
    parts.append(data)
data=b''.join(parts)
assert len(data)==metadata['bytes'] and hashlib.sha256(data).hexdigest()==metadata['sha256']
destination=root/metadata['file']
destination.write_bytes(data)
print(destination)
