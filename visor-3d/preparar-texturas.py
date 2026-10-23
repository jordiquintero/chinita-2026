from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
out=root/'visor-3d/texturas-rev2';out.mkdir(exist_ok=True)
rows=[]
for p in sorted((root/'dtf-rev2').glob('*/*.png')):
 im=Image.open(p).convert('RGBA');box=im.getbbox();im=im.crop(box)
 im.thumbnail((2048,2048),Image.Resampling.LANCZOS)
 target=out/(p.stem+'.webp');im.save(target,'WEBP',quality=91,method=6)
 rows.append({'id':p.stem,'src':'texturas-rev2/'+target.name,'original':'../'+str(p.relative_to(root)), 'crop':box, 'px':[box[2]-box[0],box[3]-box[1]],'preview':im.size})
(out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print('Texturas:',len(rows),'Bytes:',sum(p.stat().st_size for p in out.glob('*')))
