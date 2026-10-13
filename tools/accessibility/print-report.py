from pathlib import Path
import html,re
p=Path('docs/accessibility')
source=(p/'DYPA_EVIDENCE_PACKAGE.md').read_text()
audit=(p/'ACCESSIBILITY_AUDIT.md').read_text().split('## Μήτρα όλων των 50 κριτηρίων WCAG 2.1 A/AA')[1].split('## EN 301 549')[0]
source+='\n## Παράρτημα: Μήτρα κριτηρίων A/AA\n'+audit
out=[];ul=False;table=False
for line in source.splitlines():
 line=line.strip()
 if not line:
  if ul:out.append('</ul>');ul=False
  if table:out.append('</tbody></table>');table=False
  continue
 def inline(t):
  t=html.escape(t)
  t=re.sub(r'\[([^\]]+)\]\((https://[^)]+)\)',r'<a href="\2">\1</a>',t)
  return re.sub(r'\*\*(.*?)\*\*',r'<strong>\1</strong>',t)
 if line.startswith('|'):
  cells=[c.strip() for c in line.strip('|').split('|')]
  if all(set(c)<=set('-: ') for c in cells):continue
  if not table:
   out.append('<table><thead><tr>'+''.join('<th scope="col">'+inline(c)+'</th>' for c in cells)+'</tr></thead><tbody>');table=True
  else:out.append('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in cells)+'</tr>')
 elif line.startswith('#'):
  level=len(line)-len(line.lstrip('#'));out.append(f'<h{level}>'+inline(line[level:].strip())+f'</h{level}>')
 elif line.startswith('- '):
  if not ul:out.append('<ul>');ul=True
  out.append('<li>'+inline(line[2:])+'</li>')
 else:out.append('<p>'+inline(line)+'</p>')
if ul:out.append('</ul>')
if table:out.append('</tbody></table>')
page='''<!DOCTYPE html><html lang="el"><head><meta charset="utf-8"><title>Τεχνική αναφορά προσβασιμότητας — The Growth Cubes</title><style>
@page {size:A4;margin:18mm;}body {font:11pt/1.55 Arial,sans-serif;color:#171717;margin:0;}h1{font-size:24pt;line-height:1.25;color:#35111b;}h2{font-size:15pt;margin-top:24pt;break-after:avoid;}p,li{orphans:3;widows:3;}a{color:#35111b;overflow-wrap:anywhere;}table{border-collapse:collapse;width:100%;font-size:9pt;table-layout:fixed;}th,td{border:1px solid #777;padding:6px;vertical-align:top;overflow-wrap:anywhere;}th{background:#f4f0ea;text-align:left;}th:nth-child(1){width:26%;}th:nth-child(2){width:8%;}th:nth-child(3){width:22%;}thead{display:table-header-group;}tr{break-inside:avoid;}@media screen{body{max-width:900px;margin:40px auto;padding:24px;}}</style></head><body><main>'''+''.join(out)+'</main></body></html>'
(p/'DYPA_EVIDENCE_PACKAGE.html').write_text(page)
