import type { FlightEntry } from '../backend';

const HEADERS = [
  'Date', 'Student', 'Instructor', 'Aircraft', 'Type',
  'Exercise', 'Takeoff', 'Landing', 'Total', 'LandingType', 'LandingCount'
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSheetXml(entries: FlightEntry[]): string {
  const rows: string[] = [];

  // Header row
  const headerCells = HEADERS.map((h, i) => {
    const col = String.fromCharCode(65 + i);
    return `<c r="${col}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
  }).join('');
  rows.push(`<row r="1">${headerCells}</row>`);

  // Data rows
  entries.forEach((entry, rowIdx) => {
    const r = rowIdx + 2;
    const values = [
      entry.date,
      entry.student,
      entry.instructor,
      entry.aircraft,
      entry.flightType === 'solo' ? 'Solo' : 'Dual',
      entry.exercise,
      entry.takeoffTime,
      entry.landingTime,
      entry.totalFlightTime,
      entry.landingType === 'day' ? 'Day' : 'Night',
      String(entry.landingCount),
    ];
    const cells = values.map((v, i) => {
      const col = String.fromCharCode(65 + i);
      return `<c r="${col}${r}" t="inlineStr"><is><t>${escapeXml(v)}</t></is></c>`;
    }).join('');
    rows.push(`<row r="${r}">${cells}</row>`);
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows.join('')}</sheetData>
</worksheet>`;
}

function buildWorkbookXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Flight Log" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function buildWorkbookRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"
    Target="worksheets/sheet1.xml"/>
</Relationships>`;
}

function buildContentTypes(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml"
    ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml"
    ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
}

function buildRootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="xl/workbook.xml"/>
</Relationships>`;
}

function strToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint32LE(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >> 8) & 0xff;
  b[2] = (n >> 16) & 0xff;
  b[3] = (n >> 24) & 0xff;
  return b;
}

function uint16LE(n: number): Uint8Array {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >> 8) & 0xff;
  return b;
}

function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function buildZip(entries: ZipEntry[]): ArrayBuffer {
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = strToBytes(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header
    const local = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // signature
      uint16LE(20),   // version needed
      uint16LE(0),    // flags
      uint16LE(0),    // compression (stored)
      uint16LE(0),    // mod time
      uint16LE(0),    // mod date
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0),    // extra field length
      nameBytes,
      entry.data
    );
    localHeaders.push(local);

    // Central directory header
    const central = concat(
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]), // signature
      uint16LE(20),   // version made by
      uint16LE(20),   // version needed
      uint16LE(0),    // flags
      uint16LE(0),    // compression
      uint16LE(0),    // mod time
      uint16LE(0),    // mod date
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0),    // extra
      uint16LE(0),    // comment
      uint16LE(0),    // disk start
      uint16LE(0),    // internal attr
      uint32LE(0),    // external attr
      uint32LE(offset),
      nameBytes
    );
    centralHeaders.push(central);
    offset += local.length;
  }

  const centralStart = offset;
  const centralData = concat(...centralHeaders);
  const centralSize = centralData.length;

  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]), // signature
    uint16LE(0),    // disk number
    uint16LE(0),    // disk with central dir
    uint16LE(entries.length),
    uint16LE(entries.length),
    uint32LE(centralSize),
    uint32LE(centralStart),
    uint16LE(0)     // comment length
  );

  const result = concat(...localHeaders, centralData, eocd);
  return result.buffer as ArrayBuffer;
}

export function exportToExcel(entries: FlightEntry[], filename = 'flight-log.xlsx'): void {
  const sheetXml = buildSheetXml(entries);
  const workbookXml = buildWorkbookXml();
  const workbookRels = buildWorkbookRels();
  const contentTypes = buildContentTypes();
  const rootRels = buildRootRels();

  const zipEntries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: strToBytes(contentTypes) },
    { name: '_rels/.rels', data: strToBytes(rootRels) },
    { name: 'xl/workbook.xml', data: strToBytes(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: strToBytes(workbookRels) },
    { name: 'xl/worksheets/sheet1.xml', data: strToBytes(sheetXml) },
  ];

  const buffer = buildZip(zipEntries);
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
