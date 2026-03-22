'use client'

import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

const iconBackCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const fontFamily: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
}

const font = (
  size: number,
  weight: number = 400,
  color: string = '#1c1c1c',
  extra: React.CSSProperties = {}
): React.CSSProperties => ({
  ...fontFamily,
  fontSize: `${size}px`,
  fontWeight: weight,
  color,
  ...extra,
})

const FILE_TYPES = [
  { ext: '3ga',     desc: '3GP Audio File',                                  cat: 'Audio' },
  { ext: '3gp',     desc: '3GP Audio File',                                  cat: 'Audio' },
  { ext: '3gpp',    desc: '3GPP Multimedia File',                            cat: 'Movie' },
  { ext: '7z',      desc: '7Z Zipped File',                                  cat: 'Compressed Folder' },
  { ext: 'ARF',     desc: 'Advanced Recording File',                         cat: 'Movie' },
  { ext: 'IND',     desc: 'Thumbnails Index File',                           cat: 'Picture' },
  { ext: 'M3U8',    desc: 'M3U8 video file',                                 cat: 'Movie' },
  { ext: 'PKZ',     desc: 'Cisco Packet Tracer',                             cat: 'Miscellaneous' },
  { ext: 'PXZ',     desc: 'Cisco Packet Tracer',                             cat: 'Miscellaneous' },
  { ext: 'TS',      desc: 'TS Video file',                                   cat: 'Movie' },
  { ext: 'aac',     desc: 'Apple audio codec',                               cat: 'Audio' },
  { ext: 'accdb',   desc: 'Microsoft Access Database',                       cat: 'Database' },
  { ext: 'aiff',    desc: 'Audio Interchange File Format',                   cat: 'Audio' },
  { ext: 'amr',     desc: 'Adaptive Multi-Rate Codec File',                  cat: 'Audio' },
  { ext: 'arf',     desc: 'Advanced Recording File',                         cat: 'Movie' },
  { ext: 'asf',     desc: 'Advanced Systems Format File',                    cat: 'Movie' },
  { ext: 'audi',    desc: 'Audio',                                           cat: 'Audio' },
  { ext: 'avi',     desc: 'Audio Video Interleave File',                     cat: 'Movie' },
  { ext: 'awb',     desc: 'Audio',                                           cat: 'Audio' },
  { ext: 'bmp',     desc: 'Bitmap Image File',                               cat: 'Picture' },
  { ext: 'cab',     desc: 'Cabinet File',                                    cat: 'Compressed Folder' },
  { ext: 'caf',     desc: 'Core Audio Format (Apple Quicktime)',             cat: 'Audio' },
  { ext: 'cda',     desc: 'CD Audio Track',                                  cat: 'Audio' },
  { ext: 'css',     desc: 'Cascading Style Sheets',                          cat: 'Web page' },
  { ext: 'csv',     desc: 'Comma Separated Values File',                     cat: 'Text' },
  { ext: 'data',    desc: 'binary data',                                     cat: 'Miscellaneous' },
  { ext: 'doc',     desc: 'Word Document',                                   cat: 'Word' },
  { ext: 'docm',    desc: 'Word 2007 Document',                              cat: 'Word' },
  { ext: 'docx',    desc: 'Microsoft Word Open XML Document',                cat: 'Word' },
  { ext: 'dot',     desc: 'Microsoft Word Template',                         cat: 'Word' },
  { ext: 'dotm',    desc: 'Word 2007 Macro-Enabled Document Template',       cat: 'Word' },
  { ext: 'dotx',    desc: 'Word 2007 Template',                              cat: 'Word' },
  { ext: 'dss',     desc: 'Digital Speech Standard File',                    cat: 'Audio' },
  { ext: 'dwg',     desc: 'CAD File',                                        cat: 'Picture' },
  { ext: 'fig',     desc: 'Figma Design',                                    cat: 'Web page' },
  { ext: 'flv',     desc: 'Flash Video File',                                cat: 'Movie' },
  { ext: 'gan',     desc: 'Gantt Chart',                                     cat: 'Spreadsheet' },
  { ext: 'gif',     desc: 'Graphical Interchange Format File',               cat: 'Picture' },
  { ext: 'heic',    desc: 'image',                                           cat: 'Picture' },
  { ext: 'htm',     desc: 'Web Page',                                        cat: 'Web page' },
  { ext: 'html',    desc: 'Hypertext Markup Language File',                  cat: 'Web page' },
  { ext: 'iam',     desc: 'Autodesk Inventor Assembly Model File',           cat: 'Miscellaneous' },
  { ext: 'ics',     desc: 'Calendar Data',                                   cat: 'Text' },
  { ext: 'idw',     desc: 'Autodesk Inventor Drawing File',                  cat: 'Miscellaneous' },
  { ext: 'indd',    desc: 'InDesign files',                                  cat: 'Picture' },
  { ext: 'ipt',     desc: 'InterPaint Multicolor Image File',                cat: 'Picture' },
  { ext: 'jp2',     desc: 'JPEG 2000 Image File',                            cat: 'Picture' },
  { ext: 'jpeg',    desc: 'JPEG Image File',                                 cat: 'Picture' },
  { ext: 'jpg',     desc: 'JPEG Image File',                                 cat: 'Picture' },
  { ext: 'json',    desc: 'json',                                            cat: 'Miscellaneous' },
  { ext: 'key',     desc: 'Apple Keynote Slides',                            cat: 'Publisher' },
  { ext: 'm2ts',    desc: 'AVCHD Video',                                     cat: 'Movie' },
  { ext: 'm3u',     desc: 'Media Playlist File',                             cat: 'Audio' },
  { ext: 'm4a',     desc: 'M4A Audio',                                       cat: 'Audio' },
  { ext: 'm4v',     desc: 'M4V Video File',                                  cat: 'Movie' },
  { ext: 'mdb',     desc: 'Microsoft Access Database',                       cat: 'Database' },
  { ext: 'mid',     desc: 'MIDI File',                                       cat: 'Audio' },
  { ext: 'mkv',     desc: 'Matroska Video File',                             cat: 'Movie' },
  { ext: 'mov',     desc: 'Apple QuickTime Movie',                           cat: 'Movie' },
  { ext: 'mp3',     desc: 'MP3 Audio File',                                  cat: 'Audio' },
  { ext: 'mp4',     desc: 'MPEG-4 Video File',                               cat: 'Movie' },
  { ext: 'mpeg',    desc: 'MPEG Video File',                                 cat: 'Movie' },
  { ext: 'mpg',     desc: 'MPEG Video File',                                 cat: 'Movie' },
  { ext: 'mpp',     desc: 'Microsoft Project File',                          cat: 'Miscellaneous' },
  { ext: 'msg',     desc: 'Outlook Mail Message',                            cat: 'Email' },
  { ext: 'numbers', desc: 'Apple Numbers Spreadsheet',                       cat: 'Spreadsheet' },
  { ext: 'odf',     desc: 'OpenDocument Formula',                            cat: 'Miscellaneous' },
  { ext: 'odg',     desc: 'OpenDocument Graphics File',                      cat: 'Picture' },
  { ext: 'odp',     desc: 'OpenDocument Presentation',                       cat: 'Presentation' },
  { ext: 'ods',     desc: 'OpenDocument Spreadsheet',                        cat: 'Spreadsheet' },
  { ext: 'odt',     desc: 'OpenDocument Text Document',                      cat: 'Word' },
  { ext: 'ogg',     desc: 'Ogg Vorbis Audio File',                           cat: 'Audio' },
  { ext: 'ogv',     desc: 'Ogg Video File',                                  cat: 'Movie' },
  { ext: 'pages',   desc: 'Apple Pages Document',                            cat: 'Word' },
  { ext: 'pdf',     desc: 'Portable Document Format File',                   cat: 'Pdf' },
  { ext: 'png',     desc: 'Portable Network Graphic',                        cat: 'Picture' },
  { ext: 'pot',     desc: 'PowerPoint Template',                             cat: 'Presentation' },
  { ext: 'potm',    desc: 'PowerPoint Macro-Enabled Template',               cat: 'Presentation' },
  { ext: 'potx',    desc: 'PowerPoint Open XML Template',                    cat: 'Presentation' },
  { ext: 'pps',     desc: 'PowerPoint Slide Show',                           cat: 'Presentation' },
  { ext: 'ppsx',    desc: 'PowerPoint Open XML Slide Show',                  cat: 'Presentation' },
  { ext: 'ppt',     desc: 'PowerPoint Presentation',                         cat: 'Presentation' },
  { ext: 'pptm',    desc: 'PowerPoint Open XML Macro-Enabled Presentation',  cat: 'Presentation' },
  { ext: 'pptx',    desc: 'PowerPoint Open XML Presentation',                cat: 'Presentation' },
  { ext: 'psd',     desc: 'Adobe Photoshop Document',                        cat: 'Picture' },
  { ext: 'pub',     desc: 'Publisher Document',                              cat: 'Publisher' },
  { ext: 'rar',     desc: 'WinRAR Compressed Archive',                       cat: 'Compressed Folder' },
  { ext: 'rtf',     desc: 'Rich Text Format File',                           cat: 'Word' },
  { ext: 'sql',     desc: 'SQL Database File',                               cat: 'Database' },
  { ext: 'svg',     desc: 'Scalable Vector Graphics File',                   cat: 'Picture' },
  { ext: 'swf',     desc: 'Shockwave Flash Movie',                           cat: 'Movie' },
  { ext: 'tif',     desc: 'Tagged Image File',                               cat: 'Picture' },
  { ext: 'tiff',    desc: 'Tagged Image File Format',                        cat: 'Picture' },
  { ext: 'txt',     desc: 'Plain Text File',                                 cat: 'Text' },
  { ext: 'vsd',     desc: 'Visio Drawing File',                              cat: 'Picture' },
  { ext: 'vsdx',    desc: 'Visio Drawing',                                   cat: 'Picture' },
  { ext: 'wav',     desc: 'WAVE Audio File',                                 cat: 'Audio' },
  { ext: 'webm',    desc: 'WebM Video File',                                 cat: 'Movie' },
  { ext: 'webp',    desc: 'WebP Image',                                      cat: 'Picture' },
  { ext: 'wma',     desc: 'Windows Media Audio File',                        cat: 'Audio' },
  { ext: 'wmv',     desc: 'Windows Media Video File',                        cat: 'Movie' },
  { ext: 'xls',     desc: 'Microsoft Excel Spreadsheet',                     cat: 'Spreadsheet' },
  { ext: 'xlsm',    desc: 'Excel Macro-Enabled Workbook',                    cat: 'Spreadsheet' },
  { ext: 'xlsx',    desc: 'Microsoft Excel Open XML Spreadsheet',            cat: 'Spreadsheet' },
  { ext: 'xlt',     desc: 'Excel Template',                                  cat: 'Spreadsheet' },
  { ext: 'xltm',    desc: 'Excel Macro-Enabled Template',                    cat: 'Spreadsheet' },
  { ext: 'xltx',    desc: 'Excel Open XML Template',                         cat: 'Spreadsheet' },
  { ext: 'xml',     desc: 'XML File',                                        cat: 'Text' },
  { ext: 'xps',     desc: 'XML Paper Specification File',                    cat: 'Pdf' },
  { ext: 'zip',     desc: 'Zipped File',                                     cat: 'Compressed Folder' },
]

export default function SupportedFileFormatPage() {
  const router = useRouter()

  return (
    <div>
      {/* Title Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconBackCircle}
          alt="Back"
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
          onClick={() => router.back()}
        />
        <h1 style={{ ...font(24, 700, '#000'), margin: 0, letterSpacing: '-0.48px', lineHeight: '32px' }}>
          Supported file format
        </h1>
      </div>

      {/* Info Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '20px',
      }}>
        <span style={{ fontSize: '16px', marginTop: '1px' }}>🟢</span>
        <p style={{ ...font(14, 400, '#1c1c1c'), margin: 0, lineHeight: '20px' }}>
          This is a list of file types that you are able to upload into OneFile. If the file you are trying to upload is not listed then please contact us
        </p>
      </div>

      {/* Table */}
      <div style={{
        border: '1px solid rgba(28,28,28,0.15)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#888888' }}>
              <th style={{ ...font(13, 600, '#fff'), padding: '10px 16px', textAlign: 'center', width: '220px', borderRight: '1px solid rgba(255,255,255,0.15)' }}>File Extension</th>
              <th style={{ ...font(13, 600, '#fff'), padding: '10px 16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.15)' }}>Description</th>
              <th style={{ ...font(13, 600, '#fff'), padding: '10px 16px', textAlign: 'center', width: '200px' }}>Category</th>
            </tr>
          </thead>
          <tbody>
            {FILE_TYPES.map((row, i) => (
              <tr key={i} style={{ backgroundColor: '#fff', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '8px 16px', borderRight: '1px solid rgba(28,28,28,0.08)' }}>{row.ext}</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '8px 16px', borderRight: '1px solid rgba(28,28,28,0.08)' }}>{row.desc}</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '8px 16px' }}>{row.cat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
