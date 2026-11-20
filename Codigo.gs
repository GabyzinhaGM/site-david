const ABA = 'Mensagens';
const COLUNAS = ['Nome','Tipo','Mensagem','Nota','Data','Status','ID','Serviço'];
function aba_() {
  const s = SpreadsheetApp.getActiveSpreadsheet();
  let a = s.getSheetByName(ABA);
  if (!a) a = s.insertSheet(ABA);
  if (a.getLastRow() === 0) a.appendRow(COLUNAS);
  return a;
}
function limpar_(v, max) { return String(v == null ? '' : v).trim().slice(0,max); }
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.website) return resposta_('Recebido.'); // honeypot
    const nome = limpar_(p.nome,60), mensagem = limpar_(p.mensagem,1200);
    const tipo = p.tipo === 'Avaliacao' ? 'Avaliação' : 'Recado';
    const nota = tipo === 'Avaliação' ? limpar_(p.nota,1) : '';
    const servico = tipo === 'Avaliação' ? limpar_(p.servico,80) : '';
    if (!nome || !mensagem || (tipo === 'Avaliação' && !['1','2','3','4','5'].includes(nota))) return resposta_('Dados incompletos.');
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try { aba_().appendRow([nome,tipo,mensagem,nota,new Date(),'Pendente',Utilities.getUuid(),servico]); }
    finally { lock.releaseLock(); }
    return resposta_('Recebido para aprovação.');
  } catch (err) { return resposta_('Não foi possível registrar. Tente novamente.'); }
}
function resposta_(msg) { return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT); }
function doGet(e) {
  const p = (e && e.parameter) || {};
  const tipo = p.tipo === 'avaliacoes' ? 'Avaliação' : 'Recado';
  const rows = aba_().getDataRange().getValues().slice(1);
  const result = rows.filter(r => String(r[5]).trim().toLowerCase() === 'aprovado' && r[1] === tipo)
    .slice(-100).reverse().map(r => ({nome:String(r[0]),mensagem:String(r[2]),nota:String(r[3]),servico:String(r[7]||'')}));
  // JSONP é apenas leitura; o endpoint não fornece nenhuma operação de aprovação.
  const cb = String(p.callback||'');
  if (!/^DavidPublicacoes_[a-zA-Z0-9_]+$/.test(cb)) return resposta_('Callback inválido.');
  return ContentService.createTextOutput(cb+'('+JSON.stringify(result)+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
