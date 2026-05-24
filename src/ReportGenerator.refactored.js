const PRIORITY_THRESHOLD = 1000;
const MAX_USER_ITEM_VALUE = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const processedItems = this._filterAndProcessItems(user, items);

    if (reportType === 'CSV') {
      return this._generateCSV(user, processedItems);
    }
    
    if (reportType === 'HTML') {
      return this._generateHTML(user, processedItems);
    }

    return '';
  }

  _filterAndProcessItems(user, items) {
    const processed = [];
    for (const item of items) {
      if (user.role === 'ADMIN') {
        const enrichedItem = { ...item };
        if (enrichedItem.value > PRIORITY_THRESHOLD) {
          enrichedItem.priority = true;
        }
        processed.push(enrichedItem);
      } else if (user.role === 'USER' && item.value <= MAX_USER_ITEM_VALUE) {
        processed.push({ ...item });
      }
    }
    return processed;
  }

  _generateCSV(user, items) {
    let report = 'ID,NOME,VALOR,USUARIO\n';
    let total = 0;

    for (const item of items) {
      report += `${item.id},${item.name},${item.value},${user.name}\n`;
      total += item.value;
    }

    report += '\nTotal,,\n';
    report += `${total},,\n`;

    return report.trim();
  }

  _generateHTML(user, items) {
    let report = '<html><body>\n';
    report += '<h1>Relatório</h1>\n';
    report += `<h2>Usuário: ${user.name}</h2>\n`;
    report += '<table>\n';
    report += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';

    let total = 0;
    for (const item of items) {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      report += `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
      total += item.value;
    }

    report += '</table>\n';
    report += `<h3>Total: ${total}</h3>\n`;
    report += '</body></html>\n';

    return report.trim();
  }
}
