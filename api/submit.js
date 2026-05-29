const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const { nome, idade, data, respondente, profissional, obs,
            desatencao, hiperatividade, opositivos, total,
            pdfBase64, pdfFilename } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1C5F6E;padding:20px 24px;border-radius:8px 8px 0 0">
          <p style="color:rgba(255,255,255,.6);font-size:11px;margin:0 0 4px;letter-spacing:2px;text-transform:uppercase">Clinica Emanah</p>
          <h1 style="color:#fff;margin:0;font-size:24px">SNAP-IV</h1>
          <p style="color:rgba(255,255,255,.65);font-size:12px;margin:4px 0 0">Novo formulario recebido</p>
        </div>
        <div style="background:#f9f7f4;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e0dad1">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96;width:130px">Paciente</td><td style="font-weight:700;font-size:14px">${nome}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Idade</td><td style="font-size:14px">${idade}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Data</td><td style="font-size:14px">${data}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Respondente</td><td style="font-size:14px">${respondente}</td></tr>
            <tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Profissional</td><td style="font-size:14px">${profissional}</td></tr>
            ${obs ? `<tr><td style="padding:6px 0;font-size:13px;color:#7e8b96">Obs.</td><td style="font-size:14px">${obs}</td></tr>` : ''}
          </table>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;border:1px solid #e0dad1">
            <thead><tr style="background:#1C5F6E">
              <th style="padding:10px 14px;text-align:left;color:#fff;font-size:12px">Dominio</th>
              <th style="padding:10px 14px;text-align:center;color:#fff;font-size:12px">Pontuacao</th>
              <th style="padding:10px 14px;text-align:center;color:#fff;font-size:12px">Itens positivos</th>
            </tr></thead>
            <tbody>
              <tr style="background:#f0f8fa"><td style="padding:9px 14px;font-size:13px;font-weight:600">Desatencao</td><td style="padding:9px 14px;text-align:center">${desatencao.score}/27</td><td style="padding:9px 14px;text-align:center">${desatencao.pos}/9</td></tr>
              <tr><td style="padding:9px 14px;font-size:13px;font-weight:600">Hiperatividade/Impuls.</td><td style="padding:9px 14px;text-align:center">${hiperatividade.score}/27</td><td style="padding:9px 14px;text-align:center">${hiperatividade.pos}/9</td></tr>
              <tr style="background:#f0f8fa"><td style="padding:9px 14px;font-size:13px;font-weight:600">Sint. Opositivos</td><td style="padding:9px 14px;text-align:center">${opositivos.score}/21</td><td style="padding:9px 14px;text-align:center">${opositivos.pos}/7</td></tr>
              <tr style="background:#1C5F6E;border-top:2px solid #1C5F6E">
                <td style="padding:10px 14px;font-size:14px;font-weight:700;color:#fff">TOTAL</td>
                <td style="padding:10px 14px;text-align:center;font-size:16px;font-weight:700;color:#fff">${total}/75</td>
                <td style="padding:10px 14px;text-align:center;color:#C9985A;font-weight:700;font-size:14px">${desatencao.pos+hiperatividade.pos+opositivos.pos}/25 itens+</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:11px;color:#aaa;margin-top:16px">PDF completo em anexo.</p>
        </div>
      </div>`;

    const payload = {
      from: 'SNAP-IV Emanah <noreply@bomfuturo.com.br>',
      to: ['dani_lbc@hotmail.com', 'Daniele@clinicaemanah.com.br', 'jean_toya@hotmail.com'],
      subject: `SNAP-IV - ${nome} - ${data}`,
      html,
    };

    if (pdfBase64) {
      payload.attachments = [{
        filename: pdfFilename || `SNAP-IV_${nome}.pdf`,
        content:  pdfBase64,
      }];
    }

    const result = await resend.emails.send(payload);
    console.log('Resend result:', JSON.stringify(result));
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
