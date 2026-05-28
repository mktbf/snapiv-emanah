const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const {
      nome, idade, data, respondente, profissional, obs,
      desatencao, hiperatividade, opositivos, total,
      respostas, pdfBase64, pdfFilename
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1C5F6E;padding:20px 24px;border-radius:8px 8px 0 0">
          <p style="color:rgba(255,255,255,.6);font-size:11px;margin:0 0 4px;letter-spacing:2px;text-transform:uppercase">Clínica Emanah</p>
          <h1 style="color:#fff;margin:0;font-size:24px">SNAP-IV</h1>
          <p style="color:rgba(255,255,255,.65);font-size:12px;margin:4px 0 0">Novo formulário recebido</p>
        </div>
        <div style="background:#f9f7f4;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e0dad1">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96;width:140px">Paciente</td><td style="font-weight:700;font-size:14px">${nome}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Idade</td><td style="font-size:14px">${idade}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Data</td><td style="font-size:14px">${data}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Respondente</td><td style="font-size:14px">${respondente}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Profissional</td><td style="font-size:14px">${profissional}</td></tr>
            ${obs ? `<tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Observações</td><td style="font-size:14px">${obs}</td></tr>` : ''}
          </table>
          <h3 style="color:#1C5F6E;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px">Resultados</h3>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0dad1">
            <thead><tr style="background:#1C5F6E">
              <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px">Domínio</th>
              <th style="padding:10px 14px;text-align:center;color:#fff;font-size:12px">Pontuação</th>
              <th style="padding:10px 14px;text-align:center;color:#fff;font-size:12px">Itens positivos</th>
            </tr></thead>
            <tbody>
              <tr style="background:#f0f8fa"><td style="padding:9px 14px;font-size:13px;font-weight:600">Desatenção</td><td style="padding:9px 14px;text-align:center;font-size:13px">${desatencao.score}/27</td><td style="padding:9px 14px;text-align:center;font-size:13px">${desatencao.pos}/9</td></tr>
              <tr><td style="padding:9px 14px;font-size:13px;font-weight:600">Hiperatividade/Impuls.</td><td style="padding:9px 14px;text-align:center;font-size:13px">${hiperatividade.score}/27</td><td style="padding:9px 14px;text-align:center;font-size:13px">${hiperatividade.pos}/9</td></tr>
              <tr style="background:#f0f8fa"><td style="padding:9px 14px;font-size:13px;font-weight:600">Sint. Opositivos</td><td style="padding:9px 14px;text-align:center;font-size:13px">${opositivos.score}/21</td><td style="padding:9px 14px;text-align:center;font-size:13px">${opositivos.pos}/7</td></tr>
              <tr style="background:#1C5F6E22"><td style="padding:9px 14px;font-size:13px;font-weight:700">TOTAL</td><td style="padding:9px 14px;text-align:center;font-size:14px;font-weight:700">${total}/75</td><td style="padding:9px 14px;text-align:center">—</td></tr>
            </tbody>
          </table>
          <p style="font-size:11px;color:#aaa;margin-top:20px">O PDF completo com todas as respostas está em anexo.<br>Este instrumento auxilia no rastreio mas não substitui avaliação clínica.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Clínica Emanah – SNAP-IV" <${process.env.GMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO,
      subject: `SNAP-IV – ${nome} – ${data}`,
      html: htmlBody,
      attachments: pdfBase64 ? [{
        filename: pdfFilename || `SNAP-IV_${nome}.pdf`,
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf',
      }] : [],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
