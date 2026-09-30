/* Goldman Snacks: animated explainers and YouTube videos for each topic */
(function(){
  /* ---------- helpers to build scenes ---------- */
  function A(o){o=o||{};var s='';if(o.s!=null)s+=' data-s="'+o.s+'"';if(o.e!=null)s+=' data-e="'+o.e+'"';if(o.hl)s+=' data-hl="'+o.hl+'"';if(o.t)s+=' data-t="'+o.t+'"';if(o.h)s+=' data-h="'+o.h+'"';if(o.c)s+=' data-c="'+o.c+'"';return s;}
  function R(label,amt,o){o=o||{};return '<div class="xr'+(o.cls?' '+o.cls:'')+'"'+A({s:o.s,e:o.e,hl:o.hl,c:o.c})+'><span>'+label+'</span><span class="xa"'+A({t:o.t})+'>'+amt+'</span></div>';}
  /* 3-column statement row: label | inner | outer */
  function S(label,inner,outer,o){o=o||{};return '<div class="xs3'+(o.cls?' '+o.cls:'')+'"'+A({s:o.s,hl:o.hl})+'><span>'+label+'</span><span class="xa">'+(inner||'')+'</span><span class="xa'+(o.dbl?' dbl':'')+(o.tl?' tl':'')+'">'+(outer||'')+'</span></div>';}

  var X={};

  X.equation={title:'The accounting equation',caps:[
    'The accounting equation: what a business owns always equals what it owes, plus what the owner has put in.',
    'The owner pays £10,000 into the business bank account. Assets go up by £10,000 (bank) and equity goes up by £10,000 (capital).',
    'The business borrows £5,000. Assets go up (bank is now £15,000) and liabilities go up (loan £5,000).',
    'It buys a van for £8,000 cash. One asset goes up and another goes down, so total assets stay at £15,000.',
    'It buys £2,000 of stock on credit. Assets go up (inventory) and liabilities go up (trade payables).',
    'It sells all that stock for £3,000 cash. Bank goes up £3,000, inventory goes down £2,000, and the £1,000 profit adds to equity.',
    'Every transaction has two effects, so the equation always balances: £18,000 = £7,000 + £11,000.'],
   stage:'<div class="x-eq">'+
    '<div class="x-col"><h5>Assets</h5>'+R('Bank','10,000',{s:1,hl:'1,2,3,5',t:'1:10,000|2:15,000|3:7,000|5:10,000'})+R('Van','8,000',{s:3,hl:'3'})+R('Inventory','2,000',{s:4,hl:'4,5',t:'4:2,000|5:0'})+'<div class="x-tot">Total <b data-t="0:0|1:10,000|2:15,000|4:17,000|5:18,000">0</b></div></div>'+
    '<div class="x-op">=</div>'+
    '<div class="x-col"><h5>Liabilities</h5>'+R('Loan','5,000',{s:2,hl:'2'})+R('Trade payables','2,000',{s:4,hl:'4'})+'<div class="x-tot">Total <b data-t="0:0|2:5,000|4:7,000">0</b></div></div>'+
    '<div class="x-op">+</div>'+
    '<div class="x-col"><h5>Equity</h5>'+R('Capital','10,000',{s:1,hl:'1'})+R('Profit','1,000',{s:5,hl:'5'})+'<div class="x-tot">Total <b data-t="0:0|1:10,000|5:11,000">0</b></div></div>'+
    '</div><div class="x-check" data-s="6">✓ Balanced: £18,000 = £7,000 + £11,000</div>'};

  X.dcrules={title:'DEAD CLIC: which side?',caps:[
    'DEAD CLIC tells you which side of an account an entry goes on.',
    'DEAD: Debits increase Expenses, Assets and Drawings.',
    'CLIC: Credits increase Liabilities, Income and Capital.',
    'To increase an account, use its own side. To decrease it, use the opposite side.',
    'Example: the business pays rent of £500 from its bank account.',
    'Rent is an expense and it goes up. Expenses increase with a debit, so debit Rent £500.',
    'Bank is an asset and it goes down. Assets decrease with a credit, so credit Bank £500.',
    'Debits £500 = credits £500. Every entry balances.'],
   stage:'<div class="x-dc">'+
    '<div class="x-dcc"><h5>Debit side</h5>'+
      '<div class="x-l" data-s="1"><b>D</b>ebits increase</div><div class="x-l" data-s="1" data-hl="5"><b>E</b>xpenses</div><div class="x-l" data-s="1" data-hl="6"><b>A</b>ssets</div><div class="x-l" data-s="1"><b>D</b>rawings</div></div>'+
    '<div class="x-dcc"><h5>Credit side</h5>'+
      '<div class="x-l" data-s="2"><b>C</b>redits increase</div><div class="x-l" data-s="2"><b>L</b>iabilities</div><div class="x-l" data-s="2"><b>I</b>ncome</div><div class="x-l" data-s="2"><b>C</b>apital</div></div>'+
    '</div><div class="x-note" data-s="3">Increase: same side &nbsp;·&nbsp; Decrease: opposite side</div>'+
    '<div class="x-ex" data-s="4"><div class="x-q">Paid rent of £500 from the bank</div>'+
      R('Dr Rent (expense ↑)','500',{s:5,hl:'5'})+R('Cr Bank (asset ↓)','500',{s:6,hl:'6',cls:'cr'})+
      '<div class="x-check" data-s="7">✓ Debits £500 = credits £500</div></div>'};

  X.journals={title:'Writing a journal entry',caps:[
    'A journal records a transaction as a debit and a credit before it is posted to the ledger.',
    'Step 1: which accounts change? Equipment, an asset, goes up. Assets increase on the debit side.',
    'Trade payables, a liability, goes up because the business now owes the supplier. Liabilities increase on the credit side.',
    'Step 2: write the debit first: Dr Equipment £4,000.',
    'Then the credit, indented: Cr Trade payables £4,000.',
    'Step 3: add a short narration saying what happened.',
    'Check: debits £4,000 = credits £4,000.'],
   stage:'<div class="x-q">Bought equipment for £4,000 on credit from Supplier Ltd</div>'+
    '<div class="x-an">'+
      '<div class="x-l" data-s="1" data-hl="1,3"><b>Equipment</b> · asset · goes up → <em>Debit</em></div>'+
      '<div class="x-l" data-s="2" data-hl="2,4"><b>Trade payables</b> · liability · goes up → <em>Credit</em></div></div>'+
    '<div class="x-tbl" data-s="3"><div class="xs3 xh"><span>Account</span><span class="xa">Dr £</span><span class="xa">Cr £</span></div>'+
      S('Equipment','4,000','',{s:3,hl:'3'})+S('<i class="ind">Trade payables</i>','','4,000',{s:4,hl:'4'})+
      '<div class="xs3 narr" data-s="5"><span>(Equipment bought on credit from Supplier Ltd)</span><span></span><span></span></div>'+
      S('<b>Totals</b>','<b>4,000</b>','<b>4,000</b>',{s:6,hl:'6',cls:'tot'})+'</div>'};

  X.taccounts={title:'Balancing off a T-account',caps:[
    'Balancing off a T-account shows what is left in it at the end of the period.',
    'Money paid in goes on the debit side of Bank: capital £10,000 and cash sales £3,000.',
    'Money paid out goes on the credit side: rent £1,200, wages £2,500 and purchases £4,000.',
    'Add up both sides: debits £13,000, credits £7,700.',
    'Put the bigger total, £13,000, at the bottom of both sides. The gap on the credit side is the balance carried down: £13,000 − £7,700 = £5,300.',
    'Bring the balance down on the other side: balance b/d £5,300 on the debit side. A debit balance on Bank means the business has £5,300 in the bank.'],
   stage:'<div class="x-t"><div class="x-tn">Bank</div><div class="x-tc">'+
     '<div class="x-ts"><div class="x-th">Dr</div>'+R('Capital','10,000',{s:1})+R('Sales','3,000',{s:1})+'<div class="xr ghost"><span>–</span><span>–</span></div><div class="xr ghost"><span>–</span><span>–</span></div>'+
       '<div class="xr tot" data-s="3" data-hl="3,4"><span></span><span class="xa dbl">13,000</span></div>'+
       R('Balance b/d','5,300',{s:5,hl:'5',cls:'bd'})+'</div>'+
     '<div class="x-ts"><div class="x-th">Cr</div>'+R('Rent','1,200',{s:2})+R('Wages','2,500',{s:2})+R('Purchases','4,000',{s:2})+
       R('Balance c/d','5,300',{s:4,hl:'4',cls:'bd'})+
       '<div class="xr tot" data-s="3" data-hl="3,4"><span></span><span class="xa dbl" data-t="3:7,700|4:13,000">7,700</span></div></div>'+
   '</div></div>'};

  X.tb={title:'Building a trial balance',caps:[
    'A trial balance lists every closing balance from the ledger: debit balances in one column, credit balances in the other.',
    'Bank has a debit balance of £5,300 (an asset). Capital is a credit balance of £10,000.',
    'Sales of £3,000 is income: a credit. Purchases of £4,000 is an expense: a debit.',
    'Rent £1,200 and wages £2,500 are expenses: debits.',
    'Add each column. Debits £13,000 = credits £13,000, so the double entry adds up.',
    'It cannot catch every mistake. A transaction left out completely, or posted to the wrong account, still leaves it balancing.'],
   stage:'<div class="x-tbl"><div class="xs3 xh"><span>Account</span><span class="xa">Dr £</span><span class="xa">Cr £</span></div>'+
     S('Bank','5,300','',{s:1,hl:'1'})+S('Capital','','10,000',{s:1,hl:'1'})+S('Sales','','3,000',{s:2,hl:'2'})+S('Purchases','4,000','',{s:2,hl:'2'})+
     S('Rent','1,200','',{s:3,hl:'3'})+S('Wages','2,500','',{s:3,hl:'3'})+
     '<div class="xs3 tot" data-s="4" data-hl="4"><span><b>Totals</b></span><span class="xa dbl"><b>13,000</b></span><span class="xa dbl"><b>13,000</b></span></div></div>'+
     '<div class="x-check" data-s="4">✓ Debits = credits</div><div class="x-note warn" data-s="5">Still balances with: omissions · wrong account · reversed entries · equal errors on both sides</div>'};

  var M=['J','F','M','A','M','J','J','A','S','O','N','D'];
  function months(row,fn){return '<div class="x-tl"><span class="x-tll">'+row+'</span><div class="x-mo">'+M.map(function(m,i){return fn(i,m);}).join('')+'</div></div>';}
  X.adjustments={title:'Accruals and prepayments',caps:[
    'Accruals and prepayments put each expense in the year it was used, not the year it was paid.',
    'The business paid £900 of electricity for January to September.',
    'It used electricity in October to December too, but the £300 bill hasn’t arrived. That’s an accrual: a cost it owes.',
    'Expense for the year = £900 + £300 = £1,200. Journal: Dr Electricity £300, Cr Accruals £300 (a liability).',
    'Now insurance. On 1 October the business paid £1,200 for 12 months of cover.',
    'Only October to December belong to this year: £1,200 × 3/12 = £300 expense.',
    'The other 9 months, £900, is paid in advance. That’s a prepayment (an asset). Journal: Dr Prepayments £900, Cr Insurance £900.'],
   stage:'<div class="x-year"><span></span><div class="x-mo">'+M.map(function(m){return '<i>'+m+'</i>';}).join('')+'</div></div>'+
     months('Electricity',function(i){return i<9?'<b class="paid" data-s="1" style="--d:'+(i*40)+'ms"></b>':'<b class="owed" data-s="2" data-hl="2" style="--d:'+((i-9)*60)+'ms"></b>';})+
     '<div class="x-fig"><span data-s="1">Paid £900</span><span data-s="2" class="o">Owed £300 (accrual)</span><span data-s="3" data-hl="3" class="k">Expense £1,200</span></div>'+
     months('Insurance',function(i){return i>=9?'<b class="paid" data-s="4" data-hl="5" style="--d:'+((i-9)*60)+'ms"></b>':'<b class="empty"></b>';})+
     '<div class="x-fig"><span data-s="4">Paid £1,200 on 1 Oct for 12 months</span><span data-s="5" data-hl="5" class="k">This year: £300</span><span data-s="6" data-hl="6" class="p">Prepaid: £900 (Jan–Sep next year)</span></div>'+
     '<div class="x-jn"><span data-s="3">Dr Electricity 300 · Cr Accruals 300</span><span data-s="6">Dr Prepayments 900 · Cr Insurance 900</span></div>'};

  function bar(y,h0,o){return '<div class="x-bar"'+A({s:o.s,hl:o.hl})+'><div class="x-trk"><i'+A({h:o.h})+' style="height:'+h0+'%"><b class="xa"'+A({t:o.t})+'>'+o.v+'</b></i></div><span>'+y+'</span></div>';}
  X.depreciation={title:'Depreciation: straight line vs reducing balance',caps:[
    'Depreciation spreads the cost of an asset over the years it is used.',
    'A van costs £20,000. It will be used for 4 years and then sold for about £4,000, its residual value.',
    'Straight line: (£20,000 − £4,000) ÷ 4 years = £4,000 a year.',
    'Each year the carrying amount falls by the same £4,000: £16,000, £12,000, £8,000, then £4,000.',
    'The journal each year: Dr Depreciation expense £4,000, Cr Accumulated depreciation £4,000.',
    'Reducing balance at 25% charges more early on. Year 1: £20,000 × 25% = £5,000. Year 2: £15,000 × 25% = £3,750.',
    'Disposal (straight line): the van is sold at the end of year 2 for £11,000. Its carrying amount is £12,000, so there is a £1,000 loss on disposal.'],
   stage:'<div class="x-dep"><div class="x-leg" data-t="0:Straight line|5:Reducing balance, 25%|6:Straight line">Straight line</div><div class="x-bars">'+
     bar('Cost',100,{s:1,v:'20,000'})+bar('Year 1',0,{s:3,v:'16,000',t:'3:16,000|5:15,000|6:16,000',h:'3:80|5:75|6:80'})+bar('Year 2',0,{s:3,hl:'6',v:'12,000',t:'3:12,000|5:11,250|6:12,000',h:'3:60|5:56.25|6:60'})+
     bar('Year 3',0,{s:3,v:'8,000',t:'3:8,000|5:8,438|6:8,000',h:'3:40|5:42.2|6:40'})+bar('Year 4',0,{s:3,v:'4,000',t:'3:4,000|5:6,328|6:4,000',h:'3:20|5:31.6|6:20'})+
     '</div><div class="x-side"><div class="x-f" data-s="2" data-e="4">(20,000 − 4,000) ÷ 4 = <b>4,000</b> a year</div>'+
     '<div class="x-f" data-s="4" data-e="4">Dr Depreciation expense 4,000<br>Cr Accumulated depreciation 4,000</div>'+
     '<div class="x-f" data-s="5" data-e="5">Y1: 20,000 × 25% = <b>5,000</b><br>Y2: 15,000 × 25% = <b>3,750</b></div>'+
     '<div class="x-f" data-s="6">Sold for 11,000<br>Carrying amount 12,000<br><b>Loss on disposal 1,000</b></div></div></div>'};

  X.income={title:'Building an income statement',caps:[
    'An income statement shows the profit for a period. You build it from the top down.',
    'Start with sales (revenue) for the year: £50,000.',
    'Cost of sales starts with the stock at the start of the year, £4,000, plus purchases of £30,000.',
    'Take off the stock still unsold at the year end, £6,000. Cost of sales = £4,000 + £30,000 − £6,000 = £28,000.',
    'Gross profit = sales − cost of sales = £50,000 − £28,000 = £22,000.',
    'Then take off the running costs: rent £6,000, wages £9,000 and depreciation £2,000, a total of £17,000.',
    'Net profit = £22,000 − £17,000 = £5,000.'],
   stage:'<div class="x-tbl stmt"><div class="x-stt">Income statement for the year ended 31 December</div>'+
     S('Sales','','50,000',{s:1,hl:'1'})+S('Opening inventory','4,000','',{s:2,hl:'2'})+S('Add: Purchases','30,000','',{s:2,hl:'2'})+S('Less: Closing inventory','(6,000)','',{s:3,hl:'3'})+
     S('Cost of sales','','(28,000)',{s:3,hl:'3'})+S('<b>Gross profit</b>','','<b>22,000</b>',{s:4,hl:'4',tl:1})+
     S('Rent','6,000','',{s:5})+S('Wages','9,000','',{s:5})+S('Depreciation','2,000','',{s:5})+S('Total expenses','','(17,000)',{s:5,hl:'5'})+
     S('<b>Net profit</b>','','<b>5,000</b>',{s:6,hl:'6',dbl:1})+'</div>'};

  X.sofp={title:'Building a statement of financial position',caps:[
    'The statement of financial position shows what the business owns and owes on one date.',
    'Non-current assets are kept for more than a year. The van cost £20,000, less £8,000 depreciation so far: £12,000.',
    'Current assets will turn into cash within a year: inventory £6,000, receivables £3,000 and bank £2,500. That’s £11,500.',
    'Total assets = £12,000 + £11,500 = £23,500.',
    'Take off what is owed: trade payables of £4,500. Net assets = £23,500 − £4,500 = £19,000.',
    'The bottom half is the owner’s capital: £18,000 at the start, plus £5,000 profit, less £4,000 drawings = £19,000.',
    'Both halves agree at £19,000. That’s why it’s also called a balance sheet.'],
   stage:'<div class="x-tbl stmt"><div class="x-stt">Statement of financial position at 31 December</div>'+
     S('Van at cost','20,000','',{s:1})+S('Less: Accumulated depreciation','(8,000)','12,000',{s:1,hl:'1'})+
     S('Inventory','6,000','',{s:2})+S('Trade receivables','3,000','',{s:2})+S('Bank','2,500','11,500',{s:2,hl:'2'})+
     S('<b>Total assets</b>','','<b>23,500</b>',{s:3,hl:'3',tl:1})+S('Trade payables','','(4,500)',{s:4})+S('<b>Net assets</b>','','<b>19,000</b>',{s:4,hl:'4,6',dbl:1})+
     S('Opening capital','','18,000',{s:5})+S('Add: Profit','','5,000',{s:5})+S('Less: Drawings','','(4,000)',{s:5})+S('<b>Closing capital</b>','','<b>19,000</b>',{s:5,hl:'5,6',dbl:1})+
     '</div><div class="x-check" data-s="6">✓ Net assets £19,000 = capital £19,000</div>'};

  X.partnerships={title:'Sharing profit between partners',caps:[
    'The appropriation account shares a partnership’s profit using the partnership agreement.',
    'Profit for the year is £60,000. Partners A and B share what’s left 2:1, after salaries and interest.',
    'First, salaries: B gets a salary of £10,000.',
    'Next, 5% interest on capital. A has £100,000 of capital, so £5,000. B has £60,000, so £3,000.',
    'What’s left is the residual profit: £60,000 − £10,000 − £8,000 = £42,000.',
    'Share it 2:1. A gets £42,000 × 2/3 = £28,000 and B gets £42,000 × 1/3 = £14,000.',
    'In total A gets £33,000 and B gets £27,000, which adds back to £60,000. Each share goes to that partner’s current account.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span></span><span class="xa">A £</span><span class="xa">B £</span><span class="xa">Total £</span></div>'+
     '<div class="xs4" data-s="1" data-hl="1"><span>Profit for the year</span><span></span><span></span><span class="xa">60,000</span></div>'+
     '<div class="xs4" data-s="2" data-hl="2"><span>Salary</span><span class="xa">–</span><span class="xa">10,000</span><span class="xa">(10,000)</span></div>'+
     '<div class="xs4" data-s="3" data-hl="3"><span>Interest on capital, 5%</span><span class="xa">5,000</span><span class="xa">3,000</span><span class="xa">(8,000)</span></div>'+
     '<div class="xs4 tl" data-s="4" data-hl="4"><span>Residual profit</span><span></span><span></span><span class="xa">42,000</span></div>'+
     '<div class="xs4" data-s="5" data-hl="5"><span>Shared 2:1</span><span class="xa">28,000</span><span class="xa">14,000</span><span class="xa">(42,000)</span></div>'+
     '<div class="xs4 tot" data-s="6" data-hl="6"><span><b>Total to each partner</b></span><span class="xa dbl"><b>33,000</b></span><span class="xa dbl"><b>27,000</b></span><span class="xa dbl"><b>60,000</b></span></div></div>'};

  X.incomplete={title:'Mark-up, margin and missing figures',caps:[
    'With incomplete records you work out the missing figures. Mark-up and margin are the main tools.',
    'Goods cost £40,000 and are sold at a 25% mark-up. Mark-up is profit as a % of cost: £40,000 × 25% = £10,000, so sales are £50,000.',
    'Margin is profit as a % of sales: £10,000 ÷ £50,000 = 20%. A 25% mark-up is the same as a 20% margin.',
    'Now a missing figure. Sales were £80,000 at a 20% margin, so gross profit is £16,000 and cost of sales is £64,000.',
    'Opening inventory £5,000 + purchases − closing inventory £7,000 = cost of sales £64,000.',
    'So purchases = £64,000 − £5,000 + £7,000 = £66,000.'],
   stage:'<div class="x-mm"><div class="x-mmh">Sales <b class="xa" data-t="0:50,000|3:80,000">50,000</b></div>'+
     '<div class="x-split" data-s="1"><div class="c" data-hl="1"><span>Cost</span><b class="xa" data-t="0:40,000|3:64,000">40,000</b></div><div class="p" data-hl="1,2,3"><span>Profit</span><b class="xa" data-t="0:10,000|3:16,000">10,000</b></div></div>'+
     '<div class="x-lab"><span data-s="1" data-e="2">Mark-up = 10,000 ÷ 40,000 = <b>25%</b> of cost</span><span data-s="2" data-e="2">Margin = 10,000 ÷ 50,000 = <b>20%</b> of sales</span><span data-s="3">80,000 × 20% = <b>16,000</b> gross profit</span></div></div>'+
     '<div class="x-tbl" data-s="4">'+S('Opening inventory','','5,000',{s:4})+S('Add: Purchases','','<b data-t="4:?|5:66,000" class="qm">?</b>',{s:4,hl:'5'})+S('Less: Closing inventory','','(7,000)',{s:4})+S('<b>Cost of sales</b>','','<b>64,000</b>',{s:4,dbl:1,hl:'4'})+'</div>'};

  /* ================= Statements, Year 3, Industry ready, On the job ================= */
  function card(t,body,o){o=o||{};return '<div class="x-card'+(o.cls?' '+o.cls:'')+'"'+A({s:o.s,hl:o.hl,e:o.e})+'>'+(t?'<b>'+t+'</b>':'')+'<span>'+body+'</span></div>';}
  function wf(items,max){return '<div class="x-wf">'+items.map(function(it){var lo=Math.min(it[1],it[2]),hi=Math.max(it[1],it[2]);
    return '<div class="x-wfc"'+A({s:it[4],hl:it[5]})+'><div class="x-wft"><i class="'+it[3]+'" style="bottom:'+(lo/max*100)+'%;height:'+((hi-lo)/max*100)+'%"><b class="xa">'+it[6]+'</b></i></div><span>'+it[0]+'</span></div>';}).join('')+'</div>';}

  X['fs-is']={title:'Reading a sole trader’s income statement',caps:[
    'The income statement tells you whether the business made a profit, and how.',
    'Sales for the year were £80,000. The goods sold cost £48,000.',
    'Gross profit = £80,000 − £48,000 = £32,000. That’s the profit from buying and selling, before running costs.',
    'Gross margin = £32,000 ÷ £80,000 = 40%. For every £1 of sales, 40p is left after paying for the goods.',
    'Running costs: rent £8,000, wages £10,000 and other costs £2,000, a total of £20,000.',
    'Net profit = £32,000 − £20,000 = £12,000. Net margin = £12,000 ÷ £80,000 = 15%.'],
   stage:'<div class="x-split2"><div class="x-tbl stmt">'+S('Sales','','80,000',{s:1,hl:'1'})+S('Cost of sales','','(48,000)',{s:1,hl:'1'})+S('<b>Gross profit</b>','','<b>32,000</b>',{s:2,hl:'2,3',tl:1})+
     S('Rent','8,000','',{s:4})+S('Wages','10,000','',{s:4})+S('Other costs','2,000','(20,000)',{s:4,hl:'4'})+S('<b>Net profit</b>','','<b>12,000</b>',{s:5,hl:'5',dbl:1})+'</div>'+
     '<div class="x-gauges">'+card('Gross margin','<em class="big">40%</em>32,000 ÷ 80,000',{s:3,hl:'3'})+card('Net margin','<em class="big">15%</em>12,000 ÷ 80,000',{s:5,hl:'5'})+'</div></div>'};

  X['fs-sofp']={title:'Where does each balance go?',caps:[
    'Every balance in the trial balance ends up in one of two places: the income statement or the statement of financial position.',
    'Income and expenses go to the income statement: sales, purchases, rent and wages.',
    'Things the business owns or owes on the last day go to the statement of financial position: the van, inventory, receivables, bank and payables.',
    'Capital and drawings also go to the statement of financial position, in the owner’s capital section.',
    'The link: net profit from the income statement, £12,000, is added to the owner’s capital.',
    'Capital: £30,000 + £12,000 profit − £7,000 drawings = £35,000. Net assets: £41,000 − £6,000 = £35,000. They agree.'],
   stage:'<div class="x-sort"><div class="x-bin"><h5>Income statement</h5>'+['Sales','Purchases','Rent','Wages'].map(function(t){return '<span class="x-chip" data-s="1" data-hl="1">'+t+'</span>';}).join('')+'<div class="x-card" data-s="4" data-hl="4"><b>Net profit</b><span>£12,000 →</span></div></div>'+
     '<div class="x-bin"><h5>Statement of financial position</h5>'+['Van','Inventory','Receivables','Bank','Payables'].map(function(t){return '<span class="x-chip" data-s="2" data-hl="2">'+t+'</span>';}).join('')+['Capital','Drawings'].map(function(t){return '<span class="x-chip gold" data-s="3" data-hl="3">'+t+'</span>';}).join('')+
     card('Net assets','41,000 − 6,000 = <em>35,000</em>',{s:5,hl:'5'})+card('Capital','30,000 + 12,000 − 7,000 = <em>35,000</em>',{s:5,hl:'5'})+'</div></div>'};

  X['fs-sopl']={title:'A company’s statement of profit or loss and OCI',caps:[
    'A company’s statement of profit or loss follows the IAS 1 layout. Figures here are in £000.',
    'Revenue £500 less cost of sales £300 gives gross profit of £200.',
    'Take off distribution costs £40 and administrative expenses £60: operating profit is £100.',
    'Finance costs (mainly interest) of £10 leave profit before tax of £90.',
    'Tax of £20 leaves profit for the year of £70. This goes to retained earnings.',
    'Other comprehensive income is for gains that aren’t part of trading, such as a £15 revaluation gain on property.',
    'Total comprehensive income = £70 + £15 = £85.'],
   stage:'<div class="x-tbl stmt"><div class="x-stt">Statement of profit or loss and OCI (£000)</div>'+S('Revenue','','500',{s:1})+S('Cost of sales','','(300)',{s:1})+S('<b>Gross profit</b>','','<b>200</b>',{s:1,hl:'1',tl:1})+
     S('Distribution costs','','(40)',{s:2})+S('Administrative expenses','','(60)',{s:2})+S('<b>Operating profit</b>','','<b>100</b>',{s:2,hl:'2',tl:1})+S('Finance costs','','(10)',{s:3})+S('<b>Profit before tax</b>','','<b>90</b>',{s:3,hl:'3',tl:1})+
     S('Income tax','','(20)',{s:4})+S('<b>Profit for the year</b>','','<b>70</b>',{s:4,hl:'4',tl:1})+S('OCI: gain on revaluation','','15',{s:5,hl:'5'})+S('<b>Total comprehensive income</b>','','<b>85</b>',{s:6,hl:'6',dbl:1})+'</div>'};

  X['fs-cosofp']={title:'A company’s statement of financial position',caps:[
    'A company’s statement of financial position has the same two halves as a sole trader’s, but the equity section is different. Figures are in £000.',
    'Assets: property, plant and equipment £400, plus current assets of inventory £60, receivables £50 and cash £20. Total assets £530.',
    'Equity replaces the owner’s capital: share capital £200 and share premium £50, which shareholders paid in.',
    'Reserves: a revaluation surplus of £30 and retained earnings of £120, the profits kept in the business. Total equity £400.',
    'Non-current liabilities, due after more than a year: a bank loan of £80.',
    'Current liabilities, due within a year: trade payables £35 and tax payable £15.',
    'Equity £400 + liabilities £80 + £50 = £530, which matches total assets.'],
   stage:'<div class="x-two"><div class="x-tbl"><div class="x-stt">Assets</div>'+S('Property, plant & equipment','','400',{s:1})+S('Inventory','60','',{s:1})+S('Trade receivables','50','',{s:1})+S('Cash','20','130',{s:1})+S('<b>Total assets</b>','','<b>530</b>',{s:1,hl:'1,6',dbl:1})+'</div>'+
     '<div class="x-tbl"><div class="x-stt">Equity and liabilities</div>'+S('Share capital','200','',{s:2,hl:'2'})+S('Share premium','50','',{s:2,hl:'2'})+S('Revaluation surplus','30','',{s:3,hl:'3'})+S('Retained earnings','120','400',{s:3,hl:'3'})+
     S('Bank loan','','80',{s:4,hl:'4'})+S('Trade payables','35','',{s:5,hl:'5'})+S('Tax payable','15','50',{s:5,hl:'5'})+S('<b>Total</b>','','<b>530</b>',{s:6,hl:'6',dbl:1})+'</div></div>'};

  X['fs-socie']={title:'The statement of changes in equity',caps:[
    'The statement of changes in equity shows how each part of equity moved during the year. Figures are in £000.',
    'Start with the opening balances: share capital £200 and retained earnings £100, total £300.',
    'The company issued new shares for £50. Share capital goes up to £250.',
    'Profit for the year of £70 is added to retained earnings.',
    'Dividends paid to shareholders of £30 come out of retained earnings. Dividends aren’t an expense, so they appear here, not in profit or loss.',
    'Closing balances: share capital £250, retained earnings £140, total equity £390.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span></span><span class="xa">Share cap.</span><span class="xa">Retained</span><span class="xa">Total</span></div>'+
     '<div class="xs4" data-s="1" data-hl="1"><span>At 1 January</span><span class="xa">200</span><span class="xa">100</span><span class="xa">300</span></div>'+
     '<div class="xs4" data-s="2" data-hl="2"><span>Issue of shares</span><span class="xa">50</span><span class="xa">–</span><span class="xa">50</span></div>'+
     '<div class="xs4" data-s="3" data-hl="3"><span>Profit for the year</span><span class="xa">–</span><span class="xa">70</span><span class="xa">70</span></div>'+
     '<div class="xs4" data-s="4" data-hl="4"><span>Dividends paid</span><span class="xa">–</span><span class="xa">(30)</span><span class="xa">(30)</span></div>'+
     '<div class="xs4 tot tl" data-s="5" data-hl="5"><span><b>At 31 December</b></span><span class="xa dbl"><b>250</b></span><span class="xa dbl"><b>140</b></span><span class="xa dbl"><b>390</b></span></div></div>'};

  X['fs-socf']={title:'The statement of cash flows, section by section',caps:[
    'The statement of cash flows explains why the cash balance changed. It has three sections. Figures are in £000.',
    'Operating activities, indirect method: start with profit before tax, £90, and add back depreciation, £25, because it isn’t a cash payment.',
    'Adjust for working capital: inventory up £10 and receivables up £5 use cash; payables up £8 saves cash. Cash generated from operations: £108.',
    'Pay interest £10 and tax £18. Net cash from operating activities: £80.',
    'Investing activities: bought equipment for £60 and sold old equipment for £5. Net: £55 out.',
    'Financing activities: issued shares for £20 and paid dividends of £30. Net: £10 out.',
    'Net increase in cash = £80 − £55 − £10 = £15. Opening cash £20 + £15 = closing cash £35.'],
   stage:'<div class="x-tbl stmt">'+S('Profit before tax','','90',{s:1})+S('Add: Depreciation','','25',{s:1,hl:'1'})+S('Increase in inventory','','(10)',{s:2})+S('Increase in receivables','','(5)',{s:2})+S('Increase in payables','','8',{s:2})+
     S('<b>Cash generated from operations</b>','','<b>108</b>',{s:2,hl:'2',tl:1})+S('Interest paid','','(10)',{s:3})+S('Tax paid','','(18)',{s:3})+S('<b>Net cash from operating activities</b>','','<b>80</b>',{s:3,hl:'3',tl:1})+
     S('Investing: buy PPE (60), sale proceeds 5','','(55)',{s:4,hl:'4'})+S('Financing: shares 20, dividends (30)','','(10)',{s:5,hl:'5'})+S('<b>Net increase in cash</b>','','<b>15</b>',{s:6,hl:'6',tl:1})+S('Cash at start 20 → at end','','<b>35</b>',{s:6,hl:'6',dbl:1})+'</div>'};

  X['fs-consol']={title:'Consolidating a subsidiary',caps:[
    'P buys 80% of S for £300. The group accounts show P and S as one business. Figures are in £000.',
    'Step 1: S’s net assets on the day P bought it were share capital £100 + retained earnings £150 = £250.',
    'Step 2: goodwill = what P paid, £300, + fair value of the non-controlling interest, £70, − net assets £250 = £120.',
    'Step 3: S has made £200 − £150 = £50 of profit since P bought it. Only this post-acquisition profit belongs to the group.',
    'Group retained earnings = P’s £400 + 80% × £50 = £440.',
    'Non-controlling interest = £70 at acquisition + 20% × £50 = £80.',
    'Then add every asset and liability of P and S together in full, replace P’s £300 investment with goodwill of £120, and show equity as retained earnings £440 plus NCI £80.'],
   stage:'<div class="x-cards c3">'+card('1 · Net assets at acquisition','100 + 150 = <em>250</em>',{s:1,hl:'1'})+card('2 · Goodwill','300 + 70 − 250 = <em>120</em>',{s:2,hl:'2,6'})+card('3 · Post-acquisition profit','200 − 150 = <em>50</em>',{s:3,hl:'3'})+
     card('4 · Group retained earnings','400 + (80% × 50) = <em>440</em>',{s:4,hl:'4,6'})+card('5 · Non-controlling interest','70 + (20% × 50) = <em>80</em>',{s:5,hl:'5,6'})+card('6 · Cancel','P’s investment in S (300) is replaced by goodwill',{s:6,hl:'6',cls:'gold'})+'</div>'};

  X.cashflow={title:'Why profit isn’t cash',caps:[
    'A business can make a profit and still run short of cash. This bridge turns £50,000 of profit into the cash it actually produced.',
    'Start with profit: £50,000.',
    'Add back depreciation of £12,000. It reduced profit, but no cash left the business.',
    'Receivables went up by £9,000: sales were made on credit and the cash hasn’t come in yet. Take it off.',
    'Inventory went down by £4,000: stock bought last year was used up, so less cash was spent this year. Add it back.',
    'Payables went down by £3,000: the business paid off suppliers, using cash. Take it off.',
    'Cash from operations = £50,000 + £12,000 − £9,000 + £4,000 − £3,000 = £54,000.'],
   stage:wf([['Profit',0,50,'up',1,'1','50,000'],['Depreciation',50,62,'up',2,'2','+12,000'],['Receivables',53,62,'down',3,'3','−9,000'],['Inventory',53,57,'up',4,'4','+4,000'],['Payables',54,57,'down',5,'5','−3,000'],['Cash',0,54,'tot',6,'6','54,000']],70)};

  X.ratios={title:'Four ratios in four steps',caps:[
    'Ratios turn the accounts into a few numbers you can compare. Here are the four families, using one set of figures.',
    'Profitability: gross margin = gross profit £120,000 ÷ revenue £400,000 = 30%.',
    'Liquidity: current ratio = current assets £90,000 ÷ current liabilities £60,000 = 1.5 : 1. It can cover its short-term debts 1.5 times.',
    'Efficiency: receivables days = receivables £50,000 ÷ revenue £400,000 × 365 = about 46 days to collect cash from customers.',
    'Gearing: debt £100,000 ÷ (debt £100,000 + equity £300,000) = 25%. A quarter of its long-term funding is borrowed.',
    'A ratio on its own means little. Compare it with last year, a competitor or the industry, and explain why it changed.'],
   stage:'<div class="x-cards c2">'+card('Profitability · gross margin','<em class="big">30%</em>120,000 ÷ 400,000',{s:1,hl:'1'})+card('Liquidity · current ratio','<em class="big">1.5 : 1</em>90,000 ÷ 60,000',{s:2,hl:'2'})+
     card('Efficiency · receivables days','<em class="big">46 days</em>50,000 ÷ 400,000 × 365',{s:3,hl:'3'})+card('Gearing','<em class="big">25%</em>100,000 ÷ (100,000 + 300,000)',{s:4,hl:'4'})+'</div><div class="x-note" data-s="5">Compare with: last year · competitors · industry average · budget</div>'};

  X.ifrs={title:'IAS 2: lower of cost and net realisable value',caps:[
    'IAS 2 says inventory is valued at the lower of cost and net realisable value (NRV).',
    'NRV is what the item will sell for, less the costs to finish and sell it. Item A sells for £520, with £40 of selling costs, so its NRV is £480.',
    'Item A cost £500 but its NRV is £480. Use the lower figure: £480. That’s a £20 write-down.',
    'Item B cost £300 and its NRV is £450. Cost is lower, so use £300. Don’t value stock above cost.',
    'Item C cost £200 but damaged goods will only raise £150. Use £150.',
    'Compare item by item, not in total: £480 + £300 + £150 = £930, not the £1,000 total cost.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span>Item</span><span class="xa">Cost</span><span class="xa">NRV</span><span class="xa">Use</span></div>'+
     '<div class="xs4" data-s="1" data-hl="1,2"><span>A</span><span class="xa">500</span><span class="xa">520 − 40 = 480</span><span class="xa" data-t="2:480">–</span></div>'+
     '<div class="xs4" data-s="3" data-hl="3"><span>B</span><span class="xa">300</span><span class="xa">450</span><span class="xa">300</span></div>'+
     '<div class="xs4" data-s="4" data-hl="4"><span>C</span><span class="xa">200</span><span class="xa">150</span><span class="xa">150</span></div>'+
     '<div class="xs4 tot tl" data-s="5" data-hl="5"><span><b>Total</b></span><span class="xa">1,000</span><span class="xa"></span><span class="xa dbl"><b>930</b></span></div></div>'};

  X.ias36={title:'IAS 36: testing a cash-generating unit for impairment',caps:[
    'An asset is impaired if its carrying amount is more than its recoverable amount. Here the test is for a whole factory (a cash-generating unit). Figures are in £000.',
    'Carrying amount: goodwill £100 + building £600 + machinery £200 = £900.',
    'Recoverable amount is the higher of fair value less costs of disposal (£700) and value in use (£720). So it’s £720.',
    'Impairment loss = £900 − £720 = £180.',
    'The loss hits goodwill first: goodwill of £100 is written off completely.',
    'The other £80 is shared between the other assets in proportion to their carrying amounts, 600 : 200. Building £60, machinery £20.',
    'New carrying amounts: goodwill £0, building £540, machinery £180. Total £720, equal to the recoverable amount.'],
   stage:'<div class="x-two"><div class="x-cards">'+card('Fair value less costs of disposal','700',{s:2,cls:'dim'})+card('Value in use','<em>720</em> ← higher',{s:2,hl:'2'})+card('Impairment','900 − 720 = <em>180</em>',{s:3,hl:'3'})+'</div>'+
     '<div class="x-tbl pt"><div class="xs4 xh"><span></span><span class="xa">Before</span><span class="xa">Loss</span><span class="xa">After</span></div>'+
     '<div class="xs4" data-s="1" data-hl="4"><span>Goodwill</span><span class="xa">100</span><span class="xa" data-t="4:(100)">–</span><span class="xa" data-t="4:0">–</span></div>'+
     '<div class="xs4" data-s="1" data-hl="5"><span>Building</span><span class="xa">600</span><span class="xa" data-t="5:(60)">–</span><span class="xa" data-t="5:540">–</span></div>'+
     '<div class="xs4" data-s="1" data-hl="5"><span>Machinery</span><span class="xa">200</span><span class="xa" data-t="5:(20)">–</span><span class="xa" data-t="5:180">–</span></div>'+
     '<div class="xs4 tot tl" data-s="1" data-hl="1,6"><span><b>Total</b></span><span class="xa"><b>900</b></span><span class="xa" data-t="3:(180)">–</span><span class="xa dbl" data-t="6:720">–</span></div></div></div>'};

  X.ias12={title:'IAS 12: where deferred tax comes from',caps:[
    'Deferred tax arises when the accounts and the tax rules value an asset differently.',
    'A machine cost £1,000. In the accounts, depreciation of £200 leaves a carrying amount of £800.',
    'The tax rules gave capital allowances of £400, so its tax base is £600.',
    'The temporary difference is £800 − £600 = £200. The company has had £200 more tax relief than depreciation so far, and will pay that tax back later.',
    'Deferred tax liability = £200 × 25% tax rate = £50.',
    'Journal: Dr Tax expense £50, Cr Deferred tax liability £50. The difference reverses in later years.'],
   stage:'<div class="x-two"><div class="x-cards">'+card('Accounts','Cost 1,000 − depreciation 200 = <em>800</em>',{s:1,hl:'1,3'})+card('Tax','Cost 1,000 − capital allowances 400 = <em>600</em>',{s:2,hl:'2,3'})+'</div>'+
     '<div class="x-cards">'+card('Temporary difference','800 − 600 = <em>200</em>',{s:3,hl:'3'})+card('Deferred tax liability','200 × 25% = <em>50</em>',{s:4,hl:'4'})+card('Journal','Dr Tax expense 50<br>Cr Deferred tax liability 50',{s:5,hl:'5',cls:'mono'})+'</div></div>'};

  X.ifrs9={title:'IFRS 9: amortised cost, year by year',caps:[
    'A company lends £1,000 and will get £1,210 back in 2 years, with no interest paid in between. It holds the loan to collect the cash, so it uses amortised cost.',
    'The effective interest rate that makes £1,000 grow to £1,210 in 2 years is 10%.',
    'Year 1: interest income = £1,000 × 10% = £100. The asset grows to £1,100.',
    'Year 2: interest income = £1,100 × 10% = £110. The asset grows to £1,210.',
    'At the end of year 2 the borrower pays £1,210, and the asset falls to £0.',
    'Total interest income of £210 is spread over the 2 years at a constant rate, not all at the end.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span>Year</span><span class="xa">Opening</span><span class="xa">Interest 10%</span><span class="xa">Closing</span></div>'+
     '<div class="xs4" data-s="2" data-hl="2"><span>1</span><span class="xa">1,000</span><span class="xa">100</span><span class="xa">1,100</span></div>'+
     '<div class="xs4" data-s="3" data-hl="3"><span>2</span><span class="xa">1,100</span><span class="xa">110</span><span class="xa">1,210</span></div>'+
     '<div class="xs4" data-s="4" data-hl="4"><span>Cash received</span><span class="xa"></span><span class="xa"></span><span class="xa">(1,210)</span></div>'+
     '<div class="xs4 tot tl" data-s="5" data-hl="5"><span><b>Total interest</b></span><span class="xa"></span><span class="xa dbl"><b>210</b></span><span class="xa">0</span></div></div><div class="x-note" data-s="1">1,000 × 1.10 × 1.10 = 1,210</div>'};

  X.ifrs15={title:'IFRS 15: the five steps with a phone contract',caps:[
    'A customer signs a 12-month contract: a phone plus a monthly plan, for £640 in total.',
    'Step 1: identify the contract. There is an agreement with clear terms and payment.',
    'Step 2: identify the performance obligations. There are two promises: the phone and the 12-month plan.',
    'Step 3: work out the transaction price: £640.',
    'Step 4: allocate the price using stand-alone selling prices. The phone sells alone for £500 and the plan for £300, £800 in total. Phone: £640 × 500/800 = £400. Plan: £640 × 300/800 = £240.',
    'Step 5: recognise revenue as each promise is met. The phone, £400, when it’s handed over. The plan, £240, over 12 months at £20 a month.'],
   stage:'<div class="x-steps">'+['Contract','Obligations','Price','Allocate','Recognise'].map(function(t,i){return '<div class="x-stp" data-s="'+(i+1)+'" data-hl="'+(i+1)+'"><i>'+(i+1)+'</i>'+t+'</div>';}).join('')+'</div>'+
     '<div class="x-two">'+card('Phone','Stand-alone £500 → <em data-t="0:?|4:£400">?</em><br><small data-s="5">Recognised now</small>',{s:2,hl:'4,5'})+card('12-month plan','Stand-alone £300 → <em data-t="0:?|4:£240">?</em><br><small data-s="5">£20 a month for 12 months</small>',{s:2,hl:'4,5'})+'</div>'+
     '<div class="x-note" data-s="3">Transaction price £640 · stand-alone total £800</div>'};

  X.ias37={title:'IAS 37: provision, note, or nothing?',caps:[
    'IAS 37 asks three questions to decide whether to include a provision.',
    'Question 1: is there a present obligation from a past event? For example, products already sold with a warranty.',
    'Question 2: is a payment probable, meaning more likely than not?',
    'Question 3: can the amount be estimated reliably? If all three are yes, include a provision.',
    'If a payment is only possible, disclose a contingent liability in the notes. If it’s remote, do nothing.',
    'Measure it: 1,000 items sold. 15% will need a £50 repair and 5% a £200 repair. Expected cost per item = £7.50 + £10 = £17.50. Provision = £17,500.'],
   stage:'<div class="x-flow">'+card('Present obligation from a past event?','Yes →',{s:1,hl:'1'})+card('Payment probable (over 50%)?','Yes →',{s:2,hl:'2'})+card('Reliable estimate?','Yes →',{s:3,hl:'3'})+card('Provision','in the figures',{s:3,hl:'3',cls:'gold'})+'</div>'+
     '<div class="x-two">'+card('Only possible','Disclose a contingent liability in the notes',{s:4,hl:'4'})+card('Remote','Do nothing',{s:4,hl:'4',cls:'dim'})+'</div>'+
     '<div class="x-note" data-s="5">1,000 × [(15% × £50) + (5% × £200)] = 1,000 × £17.50 = <b>£17,500</b></div>'};

  X.ias16={title:'IAS 16: revaluing a building',caps:[
    'A building cost £100,000 and is depreciated over 20 years: £5,000 a year.',
    'After 10 years, its carrying amount is £100,000 − £50,000 = £50,000.',
    'It is revalued to £80,000. The £30,000 gain goes to a revaluation surplus in equity, through other comprehensive income.',
    'Depreciation is now based on the new value: £80,000 ÷ 10 remaining years = £8,000 a year.',
    'That’s £3,000 a year more than before. This excess depreciation can be moved each year from the revaluation surplus to retained earnings.',
    'Journal for the transfer: Dr Revaluation surplus £3,000, Cr Retained earnings £3,000. It doesn’t touch profit.'],
   stage:'<div class="x-dep"><div class="x-leg">Carrying amount</div><div class="x-bars" style="grid-template-columns:repeat(3,minmax(0,1fr))">'+
     bar('Cost',100,{v:'100,000'})+bar('After 10 years',0,{s:1,hl:'1',v:'50,000',h:'1:50'})+bar('Revalued',0,{s:2,hl:'2',v:'80,000',h:'2:80'})+'</div>'+
     '<div class="x-side">'+card('Revaluation surplus','80,000 − 50,000 = <em>30,000</em>',{s:2,hl:'2'})+card('New depreciation','80,000 ÷ 10 = <em>8,000</em> a year',{s:3,hl:'3'})+card('Excess depreciation','8,000 − 5,000 = <em>3,000</em> a year',{s:4,hl:'4,5'})+'</div></div>'};

  X.ias38={title:'IAS 38: research or development?',caps:[
    'A company spends £120,000 creating a new product. IAS 38 splits the work into research and development.',
    'Research is looking for new knowledge, before anyone knows if it will work. The £30,000 spent on research is always an expense.',
    'Development starts once all six conditions are met, such as the product being technically possible and likely to make money.',
    'The £90,000 spent after that point is capitalised as an intangible asset.',
    'When the product goes on sale, the asset is amortised over its useful life. Over 5 years that’s £90,000 ÷ 5 = £18,000 a year.'],
   stage:'<div class="x-tlbar"><div class="x-ph r" data-s="1" data-hl="1"><b>Research</b><span>£30,000 → expense</span></div><div class="x-ph m" data-s="2" data-hl="2"><b>All 6 conditions met</b></div><div class="x-ph d" data-s="3" data-hl="3"><b>Development</b><span>£90,000 → asset</span></div></div>'+
     '<div class="x-cards c5">'+[1,2,3,4,5].map(function(y){return card('Year '+y,'−18,000',{s:4});}).join('')+'</div>'};

  X.ifrs16={title:'IFRS 16: the lease liability table',caps:[
    'A company leases a machine for 3 years, paying £10,000 at the end of each year. The interest rate in the lease is 5%.',
    'The lease liability starts at the present value of the payments: £10,000 × 2.7232 (the 3-year annuity factor at 5%) = £27,232. The right-of-use asset starts at the same amount.',
    'Year 1: add interest of 5% × £27,232 = £1,362, then take off the £10,000 payment. Closing liability £18,594.',
    'Year 2: interest £930, payment £10,000. Closing liability £9,524.',
    'Year 3: interest £476, payment £10,000. The liability is paid off.',
    'At the end of year 1, £9,524 is due after more than a year (non-current). The rest, £18,594 − £9,524 = £9,070, is current.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span>Year</span><span class="xa">Opening</span><span class="xa">Interest 5%</span><span class="xa">Closing</span></div>'+
     '<div class="xs4" data-s="2" data-hl="2,5"><span>1</span><span class="xa">27,232</span><span class="xa">1,362</span><span class="xa">18,594</span></div>'+
     '<div class="xs4" data-s="3" data-hl="3"><span>2</span><span class="xa">18,594</span><span class="xa">930</span><span class="xa">9,524</span></div>'+
     '<div class="xs4" data-s="4" data-hl="4"><span>3</span><span class="xa">9,524</span><span class="xa">476</span><span class="xa">0</span></div></div>'+
     '<div class="x-note" data-s="1">Each year: opening + interest − payment of 10,000 = closing</div>'+
     '<div class="x-two">'+card('Non-current at end of year 1','<em>9,524</em>',{s:5,hl:'5'})+card('Current at end of year 1','18,594 − 9,524 = <em>9,070</em>',{s:5,hl:'5'})+'</div>'};

  X.consolpl={title:'Consolidated profit or loss: removing intra-group trading',caps:[
    'P owns 80% of S. The group statement of profit or loss adds P and S together, then removes trading between them.',
    'Revenue: P £100,000 + S £60,000 = £160,000 before adjustments.',
    'S sold goods to P for £20,000. Inside the group that sale didn’t really happen, so take £20,000 off revenue and off cost of sales.',
    'S made £4,000 profit on those goods, and P still has a quarter of them. Unrealised profit = £4,000 × ¼ = £1,000. Add it to cost of sales.',
    'Group revenue £140,000, cost of sales £96,000 − £20,000 + £1,000 = £77,000, gross profit £63,000.',
    'S made the sale, so the unrealised profit reduces S’s profit: £12,000 − £1,000 = £11,000. NCI share = 20% × £11,000 = £2,200.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span></span><span class="xa">Revenue</span><span class="xa">Cost of sales</span><span class="xa">Gross profit</span></div>'+
     '<div class="xs4" data-s="1" data-hl="1"><span>P + S</span><span class="xa">160,000</span><span class="xa">(96,000)</span><span class="xa"></span></div>'+
     '<div class="xs4" data-s="2" data-hl="2"><span>Intra-group sale</span><span class="xa">(20,000)</span><span class="xa">20,000</span><span class="xa"></span></div>'+
     '<div class="xs4" data-s="3" data-hl="3"><span>Unrealised profit</span><span class="xa"></span><span class="xa">(1,000)</span><span class="xa"></span></div>'+
     '<div class="xs4 tot tl" data-s="4" data-hl="4"><span><b>Group</b></span><span class="xa dbl"><b>140,000</b></span><span class="xa dbl"><b>(77,000)</b></span><span class="xa dbl"><b>63,000</b></span></div></div>'+
     '<div class="x-note" data-s="5">NCI = 20% × (12,000 − 1,000) = <b>2,200</b></div>'};

  X.audit={title:'How an audit works',caps:[
    'An audit is an independent check that a company’s accounts give a true and fair view.',
    'Planning: the auditor learns about the business and sets materiality. With profit before tax of £2.4 million, 5% gives materiality of £120,000.',
    'Performance materiality is set lower, here 75%: £90,000. Testing to this level catches smaller errors that add up.',
    'Fieldwork: tests aim at assertions. Existence: is it real? Completeness: is everything included? Accuracy: is the amount right? Cut-off: is it in the right year?',
    'Evidence from outside the client, such as a bank confirmation, is more reliable than evidence the client produces.',
    'Reporting: no material problems gives an unmodified (clean) opinion. A material problem gives a qualified, adverse or disclaimer opinion.'],
   stage:'<div class="x-steps">'+['Plan','Fieldwork','Complete','Report'].map(function(t,i){var s=[1,3,4,5][i];return '<div class="x-stp" data-s="'+s+'" data-hl="'+s+'"><i>'+(i+1)+'</i>'+t+'</div>';}).join('')+'</div>'+
     '<div class="x-cards c2">'+card('Materiality','2,400,000 × 5% = <em>120,000</em>',{s:1,hl:'1'})+card('Performance materiality','120,000 × 75% = <em>90,000</em>',{s:2,hl:'2'})+
     card('Assertions','Existence · Completeness · Accuracy · Cut-off',{s:3,hl:'3'})+card('Best evidence','External confirmation › client documents › asking staff',{s:4,hl:'4'})+'</div>'+
     '<div class="x-note" data-s="5">Unmodified · Qualified “except for” · Adverse · Disclaimer</div>'};

  X.bookkeeping={title:'A bank reconciliation, step by step',caps:[
    'The cash book says £4,200 but the bank statement says £5,030. A bank reconciliation explains the gap.',
    'Stage 1: update the cash book for things only the bank knew about. Take off bank charges of £45 and a £300 direct debit.',
    'Add a £650 BACS receipt from a customer. The updated cash book balance is £4,505.',
    'Stage 2: start from the bank statement, £5,030. Add £1,100 paid in on the last day that the bank hasn’t processed yet.',
    'Take off cheques of £1,625 that have been sent but not yet cleared.',
    'Both sides now show £4,505, so the difference is fully explained.'],
   stage:'<div class="x-two"><div class="x-tbl"><div class="x-stt">Updated cash book</div>'+S('Balance per cash book','','4,200',{s:1})+S('Bank charges','','(45)',{s:1,hl:'1'})+S('Direct debit','','(300)',{s:1,hl:'1'})+S('BACS receipt','','650',{s:2,hl:'2'})+S('<b>Updated balance</b>','','<b>4,505</b>',{s:2,hl:'2,5',dbl:1})+'</div>'+
     '<div class="x-tbl"><div class="x-stt">Bank reconciliation</div>'+S('Balance per bank','','5,030',{s:3})+S('Add: outstanding lodgement','','1,100',{s:3,hl:'3'})+S('Less: unpresented cheques','','(1,625)',{s:4,hl:'4'})+S('<b>Balance per cash book</b>','','<b>4,505</b>',{s:4,hl:'4,5',dbl:1})+'</div></div>'+
     '<div class="x-check" data-s="5">✓ Reconciled at £4,505</div>'};

  X.groups={title:'The three group workings',caps:[
    'P buys 80% of S for £500,000. Exam questions on groups nearly always need three workings: goodwill, retained earnings and NCI.',
    'S’s net assets at acquisition: share capital £200,000 + retained earnings £300,000 = £500,000.',
    'Goodwill = £500,000 paid + £110,000 fair value of NCI − £500,000 net assets = £110,000.',
    'S’s retained earnings have grown from £300,000 to £380,000: £80,000 of post-acquisition profit.',
    'Group retained earnings = P’s £900,000 + 80% × £80,000 = £964,000.',
    'NCI = £110,000 + 20% × £80,000 = £126,000.'],
   stage:'<div class="x-cards c2">'+card('Net assets at acquisition','200,000 + 300,000 = <em>500,000</em>',{s:1,hl:'1'})+card('Goodwill','500,000 + 110,000 − 500,000 = <em>110,000</em>',{s:2,hl:'2'})+
     card('Post-acquisition profit','380,000 − 300,000 = <em>80,000</em>',{s:3,hl:'3'})+card('Group retained earnings','900,000 + (80% × 80,000) = <em>964,000</em>',{s:4,hl:'4'})+card('Non-controlling interest','110,000 + (20% × 80,000) = <em>126,000</em>',{s:5,hl:'5'})+'</div>'};

  X.interview={title:'Answering with STAR',caps:[
    'Competency questions start with “Tell me about a time when…”. STAR gives your answer a clear shape.',
    'Situation: set the scene in a sentence or two. “In my part-time job at a café, the weekly stock count kept disagreeing with the till.”',
    'Task: say what you had to do. “My manager asked me to find out why.”',
    'Action: the biggest part. Say what you did, using “I”. “I compared deliveries with invoices for four weeks and found that returns weren’t being recorded. I set up a simple returns log.”',
    'Result: what happened, with a number if you can. “The difference fell from about £200 a week to under £20.” Add what you learned.',
    'Spend most of your time on Action. Keep Situation and Task short.'],
   stage:'<div class="x-star">'+[['S','Situation','Set the scene',1],['T','Task','What you had to do',2],['A','Action','What you did: most of the answer',3],['R','Result','What happened, with a number',4]].map(function(r){return '<div class="x-sr" data-s="'+r[3]+'" data-hl="'+r[3]+'"><i>'+r[0]+'</i><b>'+r[1]+'</b><span>'+r[2]+'</span></div>';}).join('')+'</div>'+
     '<div class="x-bar2" data-s="5"><span style="width:15%">S</span><span style="width:12%">T</span><span class="big" style="width:50%">A</span><span style="width:23%">R</span></div>'};

  var XL=[['INV-1001','North',1200,'Unpaid'],['INV-1002','South',800,'Paid'],['INV-1003','North',2500,'Paid'],['INV-1004','North',650,'Unpaid'],['INV-1005','East',1100,'Unpaid'],['INV-1006','North',900,'Unpaid']];
  X.excel={title:'How SUMIFS works',caps:[
    'SUMIFS adds up the numbers in one column, but only for rows that meet every condition you give it.',
    'The formula: =SUMIFS(C:C, B:B, "North", D:D, "Unpaid"). Add column C where column B is North and column D is Unpaid.',
    'Condition 1: region is North. Four rows match.',
    'Condition 2: status is Unpaid. Of those four, three still match.',
    'Add their amounts: £1,200 + £650 + £900 = £2,750.',
    'COUNTIFS works the same way but counts the rows instead: =COUNTIFS(B:B, "North", D:D, "Unpaid") gives 3.'],
   stage:'<div class="x-f" data-s="1" style="margin-bottom:10px">=SUMIFS(C:C, B:B, "North", D:D, "Unpaid")</div><div class="x-xl"><div class="x-xr h"><span>A</span><span>B Region</span><span>C Amount</span><span>D Status</span></div>'+
     XL.map(function(r){var n=r[1]==='North',u=r[3]==='Unpaid';return '<div class="x-xr" data-hl="'+(n?'2':'')+(n&&u?',3,4':'')+'" data-c="'+(n&&u?'m':'')+'"><span>'+r[0]+'</span><span>'+r[1]+'</span><span class="xa">'+r[2].toLocaleString('en-GB')+'</span><span>'+r[3]+'</span></div>';}).join('')+
     '</div><div class="x-two" style="margin-top:10px">'+card('SUMIFS','<em>2,750</em>',{s:4,hl:'4'})+card('COUNTIFS','<em>3</em>',{s:5,hl:'5'})+'</div>'};

  X.annualreport={title:'Finding your way round an annual report',caps:[
    'An annual report can be over 200 pages. Professionals go straight to a few sections.',
    'The strategic report: the business model, key performance indicators and the main risks.',
    'Governance: who runs the company, how directors are paid, and the audit committee’s report.',
    'The auditor’s report: the opinion, and the key audit matters, which are the areas the auditor found hardest.',
    'The financial statements and notes: the four main statements, then the notes that explain each figure, including accounting policies and judgements.',
    'An auditor starts with the auditor’s report and the judgements. An investor starts with the KPIs, the cash flow and the outlook.'],
   stage:'<div class="x-cards c2">'+card('Strategic report','Business model · KPIs · principal risks',{s:1,hl:'1,5'})+card('Governance','Directors · pay · audit committee',{s:2,hl:'2'})+card('Auditor’s report','Opinion · key audit matters · materiality',{s:3,hl:'3,5'})+card('Financial statements & notes','4 statements · policies · judgements',{s:4,hl:'4,5'})+'</div>'};

  X.jobrec={title:'On the job: testing receivables',caps:[
    'Your senior asks you to test the year-end receivables listing. You’ll test any balance of £10,000 or more.',
    'Four customers are over £10,000: A, B, D and E. Customer C, at £3,200, isn’t selected.',
    'After-date cash: check the bank statements after the year end. A paid £42,000 in full. Good evidence it existed.',
    'E paid £12,400 in full. Also fine.',
    'B paid only £10,000 of £18,500. For the other £8,500, check the invoice and the signed delivery note.',
    'D has paid nothing. Ask the credit controller about it, check the aged listing and consider whether an allowance for bad debts is needed. Record everything on your working paper.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span>Customer</span><span class="xa">Balance</span><span class="xa">Paid after</span><span class="xa">Result</span></div>'+
     [['A','42,000','42,000','✓',2],['B','18,500','10,000','8,500 → docs',4],['C','3,200','','Not tested',1],['D','27,000','0','Follow up',5],['E','12,400','12,400','✓',3]].map(function(r){return '<div class="xs4'+(r[0]==='C'?' dimrow':'')+'" data-hl="'+(r[0]==='C'?'':'1,')+r[4]+'"><span>'+r[0]+'</span><span class="xa">'+r[1]+'</span><span class="xa" data-t="'+r[4]+':'+(r[2]||'–')+'">'+(r[0]==='C'?'–':'')+'</span><span class="xa" data-t="'+r[4]+':'+r[3]+'">'+(r[0]==='C'?'':'')+'</span></div>';}).join('')+'</div>'};

  X.jobcount={title:'On the job: test counts both ways',caps:[
    'At the year-end stock count you do test counts in two directions, because they test different things.',
    'Floor to sheet (completeness): pick items on the warehouse floor and check they are on the count sheet.',
    'Pallet 14 has 40 boxes on the floor and the count sheet says 40. It’s included. ✓',
    'Sheet to floor (existence): pick lines on the count sheet and find them on the floor.',
    'The sheet says item 22 has 120 units, but you count 112. A difference of 8.',
    'Record the difference, ask the counters to recount, and follow it up with the client. Also note any damaged or slow-moving stock you see.'],
   stage:'<div class="x-two"><div class="x-card" data-s="1" data-hl="1,2"><b>Warehouse floor</b><span>Pallet 14: 40 boxes<br>Item 22: <em data-t="4:112 counted">?</em></span></div>'+
     '<div class="x-card" data-s="1" data-hl="3,4"><b>Count sheet</b><span>Pallet 14: 40 ✓<br>Item 22: 120</span></div></div>'+
     '<div class="x-arrows"><div class="x-arr r" data-s="1" data-hl="1,2">Floor → sheet · completeness</div><div class="x-arr l" data-s="3" data-hl="3,4">Sheet → floor · existence</div></div>'+
     '<div class="x-note warn" data-s="4">Difference: 120 − 112 = 8 units → recount and record</div>'};

  X.jobclose={title:'On the job: the month-end close',caps:[
    'Month-end close makes sure October’s figures are complete and correct before they go to the directors.',
    'Post every sales and purchase invoice dated in October.',
    'Reconcile every bank account.',
    'Post accruals, prepayments and depreciation. The October electricity bill arrives in November, so accrue it in October.',
    'Compare actual costs with budget. Costs were £52,000 against a budget of £48,000: £4,000 over, an adverse variance.',
    'Explain the variance in plain words, for example “£3,000 of extra overtime for the new site opening”, and send the management accounts on.'],
   stage:'<div class="x-check2">'+[['Post October invoices',1],['Bank reconciliations',2],['Accruals, prepayments, depreciation',3],['Budget vs actual',4],['Commentary and send',5]].map(function(r){return '<div class="x-ck" data-s="'+r[1]+'" data-hl="'+r[1]+'"><i>✓</i>'+r[0]+'</div>';}).join('')+'</div>'+
     '<div class="x-two">'+card('Actual','<em>52,000</em>',{s:4})+card('Budget','<em>48,000</em>',{s:4})+'</div><div class="x-note warn" data-s="4">Variance: 4,000 adverse</div>'};

  X.jobtax={title:'On the job: a VAT return and a corporation tax computation',caps:[
    'Two common trainee jobs: a quarterly VAT return and a corporation tax computation.',
    'VAT: sales of £60,000 before VAT, at 20%, mean output VAT of £12,000 charged to customers.',
    'Purchases of £25,000 before VAT carry input VAT of £5,000, which the business can reclaim.',
    'VAT payable to HMRC = £12,000 − £5,000 = £7,000.',
    'Corporation tax starts from accounting profit of £300,000. Add back costs the tax rules don’t allow: depreciation £10,000 and client entertaining £5,000.',
    'Take off capital allowances, the tax version of depreciation, of £15,000. Taxable profit is £300,000.',
    'Corporation tax at the 25% main rate = £75,000.'],
   stage:'<div class="x-two"><div class="x-tbl"><div class="x-stt">VAT return</div>'+S('Output VAT (60,000 × 20%)','','12,000',{s:1,hl:'1'})+S('Input VAT (25,000 × 20%)','','(5,000)',{s:2,hl:'2'})+S('<b>Payable to HMRC</b>','','<b>7,000</b>',{s:3,hl:'3',dbl:1})+'</div>'+
     '<div class="x-tbl"><div class="x-stt">Corporation tax</div>'+S('Accounting profit','','300,000',{s:4})+S('Add: depreciation','','10,000',{s:4,hl:'4'})+S('Add: entertaining','','5,000',{s:4,hl:'4'})+S('Less: capital allowances','','(15,000)',{s:5,hl:'5'})+S('Taxable profit','','300,000',{s:5,tl:1})+S('<b>Tax at 25%</b>','','<b>75,000</b>',{s:6,hl:'6',dbl:1})+'</div></div>'};

  function fc(){var v=[['Now',40],['M1',25],['M2',5],['M3',10],['M4',-15],['M5',-5],['M6',-15]],lo=-20,span=65,z=20/span*100;
    return '<div class="x-fc"><div class="x-fcz" style="bottom:'+z+'%"></div><div class="x-fcl" data-s="3" style="bottom:'+(10/span*100)+'%"><span>Overdraft limit −10</span></div>'+v.map(function(p,i){var b=p[1]>=0?z:(20+p[1])/span*100,h=Math.abs(p[1])/span*100,bad=p[1]<-10;
      return '<div class="x-fcc" data-s="'+(i<1?1:2)+'" data-hl="'+(bad?'3,4':'')+'"><i class="'+(p[1]<0?'neg':'')+(bad?' bad':'')+'" style="bottom:'+b+'%;height:'+h+'%"></i><b class="xa" style="bottom:'+(p[1]>=0?b+h:b-9)+'%">'+String(p[1]).replace('-','−')+'</b><span>'+p[0]+'</span></div>';}).join('')+'</div>';}
  X.jobgc={title:'On the job: a going concern review',caps:[
    'Going concern asks whether the client can keep trading for at least the next 12 months. You’ve been given its cash flow forecast, in £000.',
    'It starts with £40,000 of cash.',
    'Month by month the balance falls: £25,000, £5,000, £10,000, then minus £15,000 in month 4.',
    'The bank overdraft limit is £10,000. In months 4 and 6 the forecast goes past it.',
    'Warning signs: the overdraft limit is breached and the cash keeps falling. Ask how it will be funded, check the loan covenants, and test the forecast’s assumptions.',
    'If there is significant doubt, the accounts must disclose a material uncertainty, and the audit report will draw attention to it.'],
   stage:fc()+'<div class="x-note warn" data-s="4">Breach in month 4 and month 6 → material uncertainty?</div>'};

  X.jobpay={title:'On the job: a payroll proof in total',caps:[
    'An analytical review of payroll predicts what wages should be, then compares that with the actual figure.',
    'Last year’s wages were £1,200,000.',
    'Everyone got a 3% pay rise: £1,200,000 × 1.03.',
    'Average headcount rose from 50 to 52 people: × 52/50. Expected wages: £1,285,440.',
    'Actual wages were £1,340,000, which is £54,560 (4.2%) more than expected.',
    'That’s above the 2% threshold your senior set, so ask payroll why. It could be overtime, bonuses or errors. Then get evidence for the answer.'],
   stage:'<div class="x-tbl stmt">'+S('Last year’s wages','','1,200,000',{s:1})+S('× pay rise 1.03','','1,236,000',{s:2,hl:'2'})+S('× headcount 52/50','','1,285,440',{s:3,hl:'3'})+S('<b>Expected</b>','','<b>1,285,440</b>',{s:3,tl:1})+S('Actual','','1,340,000',{s:4})+S('<b>Difference (4.2%)</b>','','<b>54,560</b>',{s:4,hl:'4,5',dbl:1})+'</div>'+
     '<div class="x-note warn" data-s="5">4.2% is above the 2% threshold → investigate</div>'};

  X.jobfa={title:'On the job: vouching fixed asset additions',caps:[
    'The client’s fixed asset register shows £81,000 of additions this year. You vouch each one to its invoice.',
    'A new machine, £45,000, invoiced in March. It’s a new asset used for years: capital. ✓',
    'Roof repairs, £8,000. Repairs keep an asset working but don’t improve it, so they’re an expense, not an addition.',
    'Laptops, £6,000, invoiced on 4 January, after the year end. They belong to next year: a cut-off error.',
    'A delivery van, £22,000, invoiced and delivered in the year. ✓',
    'Additions should be £67,000. They’re overstated by £14,000. Add it to the schedule of misstatements.'],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span>Item</span><span class="xa">Amount</span><span class="xa">Invoice</span><span class="xa">Result</span></div>'+
     [['Machine','45,000','March','✓ capital',1],['Roof repairs','8,000','June','Expense',2],['Laptops','6,000','4 Jan, next year','Cut-off',3],['Delivery van','22,000','August','✓ capital',4]].map(function(r){return '<div class="xs4" data-hl="'+r[4]+'"><span>'+r[0]+'</span><span class="xa">'+r[1]+'</span><span class="xa">'+r[2]+'</span><span class="xa" data-t="'+r[4]+':'+r[3]+'"></span></div>';}).join('')+
     '<div class="xs4 tot tl" data-s="5" data-hl="5"><span><b>Should be</b></span><span class="xa dbl"><b>67,000</b></span><span class="xa"></span><span class="xa"><b>14,000 over</b></span></div></div>'};

  X.joblease={title:'On the job: is it a lease?',caps:[
    'The finance director asks you which of three new contracts are leases under IFRS 16.',
    'Test 1: is there an identified asset that the supplier can’t swap for another?',
    'Test 2: does the company get almost all the benefits and decide how the asset is used?',
    'Office floor 3: a specific floor, and the company controls its use. That’s a lease.',
    'Cloud storage: the supplier can move the data to any server it likes. No identified asset, so it isn’t a lease. It’s a service expense.',
    'Delivery van: a specific van, used only by the company. That’s a lease. With payments of £12,000 a year for 4 years at 6%, the liability is £12,000 × 3.4651 = £41,581.'],
   stage:'<div class="x-two">'+card('Test 1','Identified asset, no real right to swap it',{s:1,hl:'1'})+card('Test 2','Gets the benefits and directs the use',{s:2,hl:'2'})+'</div>'+
     '<div class="x-cards c3">'+card('Office floor 3','<em>Lease</em>',{s:3,hl:'3'})+card('Cloud storage','<em>Not a lease</em> · service',{s:4,hl:'4',cls:'dim'})+card('Delivery van','<em>Lease</em> · liability 41,581',{s:5,hl:'5'})+'</div>'};

  /* ---------- YouTube videos (checked: they exist and allow embedding) ---------- */
  X.ias8={title:"IAS 8: policy, estimate or error?",caps:["IAS 8 sorts changes into three kinds, and each has its own treatment.", "A change in accounting policy, like switching inventory from FIFO to weighted average, is applied retrospectively: last year’s figures are restated.", "A prior period error is also corrected retrospectively, as if it had never happened.", "A change in estimate is prospective. Here, a machine cost £100,000 with a 10-year life: £10,000 a year.", "After 4 years its carrying amount is £60,000. The company now expects a total life of 8 years, so 4 years remain.", "New depreciation = £60,000 ÷ 4 = £15,000 a year from year 5. Years 1 to 4 aren’t changed."],
   stage:'<div class="x-cards c3">'+card('Policy','<em>Retrospective</em> · restate',{s:1,hl:'1'})+card('Error','<em>Retrospective</em> · restate',{s:2,hl:'2'})+card('Estimate','<em>Prospective</em> · from now on',{s:3,hl:'3,4,5'})+'</div><div class="x-two">'+card('Years 1–4','100,000 − 4 × 10,000 = <em>60,000</em>',{s:4,hl:'4'})+card('Years 5–8','60,000 ÷ 4 = <em>15,000</em> a year',{s:5,hl:'5'})+'</div>'};

  X.ias10={title:"IAS 10: adjusting or non-adjusting?",caps:["IAS 10 covers the gap between the year end and the date the directors approve the accounts.", "20 January: a customer who owed £40,000 at the year end goes into liquidation. The debt was already bad at 31 December, so this is adjusting.", "The liquidator will pay 25p in the £, so write down the receivable by £30,000 in this year’s accounts.", "8 February: a fire destroys £90,000 of stock. That’s new, so it is non-adjusting. Disclose it in the notes.", "1 March: a dividend is declared. There was no obligation at the year end, so it’s not a liability. Disclose it.", "The exception: if management decides to close the business after the year end, the accounts can’t be prepared on a going concern basis."],
   stage:'<div class="x-steps"><div class="x-stp"><i>✓</i>31 Dec year end</div><div class="x-stp" data-s="1" data-hl="1,2"><i>1</i>20 Jan</div><div class="x-stp" data-s="3" data-hl="3"><i>2</i>8 Feb</div><div class="x-stp" data-s="4" data-hl="4"><i>3</i>1 Mar</div><div class="x-stp"><i>✓</i>15 Mar approved</div></div><div class="x-cards c3">'+card('Customer liquidation','<em>Adjusting</em><br>Write down 40,000 × 75% = 30,000',{s:1,hl:'1,2'})+card('Fire','<em>Non-adjusting</em><br>Disclose the 90,000 loss',{s:3,hl:'3'})+card('Dividend declared','<em>Non-adjusting</em><br>Disclose, not a liability',{s:4,hl:'4'})+'</div><div class="x-note warn" data-s="5">Going concern: a decision to close after the year end means no going concern basis</div>'};

  X.ias20={title:"IAS 20: releasing a capital grant",caps:["A company buys a machine for £100,000 with a 5-year life, and gets a government grant of £20,000 towards it.", "The grant can’t all be income now. It’s matched to the machine’s life: £20,000 ÷ 5 = £4,000 a year.", "When the cash arrives: Dr Cash £20,000, Cr Deferred income £20,000 (a liability).", "Each year, release £4,000: Dr Deferred income, Cr Other income. After year 1, £16,000 is left.", "In the statement of financial position, £4,000 is current (next year’s release) and £12,000 is non-current."],
   stage:'<div class="x-dep"><div class="x-leg">Deferred income left</div><div class="x-bars">'+bar('Start',0,{s:1,v:'20,000',h:'1:100'})+bar('Year 1',0,{s:3,hl:'3,4',v:'16,000',h:'3:80'})+bar('Year 2',0,{s:3,v:'12,000',h:'3:60'})+bar('Year 3',0,{s:3,v:'8,000',h:'3:40'})+bar('Year 4',0,{s:3,v:'4,000',h:'3:20'})+'</div><div class="x-side">'+card('Release','20,000 ÷ 5 = <em>4,000</em> a year',{s:1,hl:'1'})+card('Receipt','Dr Cash 20,000<br>Cr Deferred income 20,000',{s:2,hl:'2',cls:'mono'})+card('End of year 1','Current <em>4,000</em> · non-current <em>12,000</em>',{s:4,hl:'4'})+'</div></div>'};

  X.ias23={title:"IAS 23: capitalising interest",caps:["IAS 23: interest on money borrowed to build an asset is part of that asset’s cost.", "On 1 April a company borrows £2,000,000 at 8% to build a warehouse, finished on 31 December.", "Interest while building: £2,000,000 × 8% × 9/12 = £120,000.", "Some of the loan was invested before it was spent, earning £10,000. Take that off.", "£110,000 is added to the warehouse’s cost. Interest after 31 December is an expense."],
   stage:'<div class="x-steps"><div class="x-stp" data-s="1" data-hl="1"><i>▶</i>1 Apr: start</div><div class="x-stp" data-s="1"><i>9</i>months building</div><div class="x-stp" data-s="1" data-hl="4"><i>■</i>31 Dec: complete</div></div><div class="x-tbl stmt">'+S('Interest 2,000,000 × 8% × 9/12','','120,000',{s:2,hl:'2'})+S('Less: investment income','','(10,000)',{s:3,hl:'3'})+S('<b>Capitalised</b>','','<b>110,000</b>',{s:4,hl:'4',dbl:1})+'</div><div class="x-note" data-s="4">Interest after completion → expense</div>'};

  X.ias33={title:"IAS 33: basic earnings per share",caps:["Earnings per share = profit for ordinary shareholders ÷ the weighted average number of shares.", "Profit after tax is £1,200,000.", "On 1 January there were 4,000,000 shares, in issue all year: 4,000,000 × 12/12.", "On 1 October 1,000,000 more were issued at full price. They count for 3 months: 1,000,000 × 3/12 = 250,000.", "Weighted average = 4,250,000 shares. EPS = £1,200,000 ÷ 4,250,000 = 28.2p."],
   stage:'<div class="x-tbl stmt">'+S('Profit after tax','','1,200,000',{s:1,hl:'1'})+S('Shares at 1 Jan × 12/12','','4,000,000',{s:2,hl:'2'})+S('Issued 1 Oct: 1,000,000 × 3/12','','250,000',{s:3,hl:'3'})+S('<b>Weighted average shares</b>','','<b>4,250,000</b>',{s:4,tl:1})+'</div><div class="x-two">'+card('Basic EPS','1,200,000 ÷ 4,250,000 = <em>28.2p</em>',{s:4,hl:'4'})+'</div>'};

  X.ias40={title:"IAS 40: the fair value model",caps:["Investment property is held to earn rent or to grow in value. A company buys an office block for £1,000,000 to lease out.", "Under the fair value model, it is remeasured to fair value at every year end.", "At 31 December the fair value is £1,080,000.", "The £80,000 gain goes straight to profit or loss, and there is no depreciation.", "Compare IAS 16: a revaluation gain on property the company uses goes to other comprehensive income instead."],
   stage:'<div class="x-dep"><div class="x-leg">Office block</div><div class="x-bars" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+bar('1 January',0,{s:1,v:'1,000,000',h:'1:92.6'})+bar('31 December',0,{s:2,hl:'2,3',v:'1,080,000',h:'2:100'})+'</div><div class="x-side">'+card('Gain','1,080,000 − 1,000,000 = <em>80,000</em> → profit or loss',{s:3,hl:'3'})+card('Depreciation','<em>None</em> under the fair value model',{s:3})+card('IAS 16 instead?','Revaluation gain → <em>OCI</em>',{s:4,hl:'4',cls:'dim'})+'</div></div>'};

  X.ias21={title:"IAS 21: retranslating a dollar payable",caps:["A UK company buys goods from the US for $50,000 on 1 November, when £1 = $1.25.", "Record the purchase and the payable at the spot rate: $50,000 ÷ 1.25 = £40,000.", "At 31 December it still owes the money, and £1 = $1.30.", "The payable is monetary, so retranslate it: $50,000 ÷ 1.30 = £38,462.", "The debt has fallen by £1,538 in pounds. That’s an exchange gain in profit or loss. The inventory isn’t retranslated: it’s non-monetary."],
   stage:'<div class="x-two">'+card('1 November','$50,000 ÷ 1.25 = <em>£40,000</em>',{s:1,hl:'1'})+card('31 December','$50,000 ÷ 1.30 = <em>£38,462</em>',{s:3,hl:'3'})+'</div><div class="x-cards c2" style="margin-top:10px">'+card('Exchange gain','40,000 − 38,462 = <em>1,538</em> → profit or loss',{s:4,hl:'4'})+card('Inventory','Stays at <em>£40,000</em> (non-monetary)',{s:4,cls:'dim'})+'</div>'};

  X.ifrs13={title:"IFRS 13: the most advantageous market",caps:["Fair value is an exit price: what you would get for selling the asset. Here, an asset trades in two markets and neither is the principal market.", "Market A: price £26, less transaction costs £3 and transport £2, nets £21.", "Market B: price £25, less transaction costs £1 and transport £2, nets £22.", "Market B gives the best net amount, so it is the most advantageous market.", "Fair value = Market B’s price less transport only: £25 − £2 = £23. Transaction costs aren’t part of fair value."],
   stage:'<div class="x-tbl pt"><div class="xs4 xh"><span>Market</span><span class="xa">A</span><span class="xa">B</span><span class="xa"></span></div><div class="xs4" data-s="1"><span>Price</span><span class="xa">26</span><span class="xa">25</span><span></span></div><div class="xs4" data-s="1"><span>Transaction costs</span><span class="xa">(3)</span><span class="xa" data-t="2:(1)">–</span><span></span></div><div class="xs4" data-s="1"><span>Transport costs</span><span class="xa">(2)</span><span class="xa" data-t="2:(2)">–</span><span></span></div><div class="xs4 tot tl" data-s="1" data-hl="3"><span><b>Net</b></span><span class="xa">21</span><span class="xa" data-t="2:22">–</span><span></span></div></div><div class="x-two">'+card('Most advantageous','<em>Market B</em> (22 beats 21)',{s:3,hl:'3'})+card('Fair value','25 − 2 transport = <em>23</em>',{s:4,hl:'4'})+'</div>'};

  var V={
    'ias8':[["icChj8MUQmY", "IAS 8 accounting policies, changes in estimates and errors", "Silvia of CPDbox"], ["wTDQa1JMpMI", "IAS 8 with a solved practical question", "RONAS Academy"]],
    'ias10':[["ijYZlb1_ZyQ", "IAS 10 events after the reporting period", "Silvia of CPDbox"], ["Hz2tqyMbs2w", "IAS 10 events after the reporting period (CIMA F1)", "OpenTuition"]],
    'ias20':[["FzomuuKLh1Q", "IAS 20 government grants explained: asset and income grants", "ICAN Intelligence Tutorials"], ["hSbp1Dmwix0", "IAS 20 accounting for government grants (part 3)", "FOG Accountancy Tutorials"]],
    'ias23':[["iFdxIUcjvqs", "IAS 23 borrowing costs explained", "Silvia of CPDbox"], ["U5y0k0rL_ms", "IAS 23 borrowing costs explained easily (ACCA FR)", "BlendEd"]],
    'ias33':[["vGB9XICkRBY", "IAS 33 earnings per share (bonus issue)", "EZIKAN ACADEMY"], ["GHM6rmtLQPM", "Earnings per share (IAS 33): ACCA SBR lecture", "OpenTuition"]],
    'ias40':[["qMVmj8sGyp4", "Investment property (IAS 40) explained with examples", "Counttuts"], ["XQniGk7pmx8", "IAS 40 investment property: change of use and model", "Hybrid Accounts"]],
    'ias21':[["ZuhBcQ5kQT4", "IAS 21 the effects of changes in foreign exchange rates", "Silvia of CPDbox"], ["O2XIidQDHMo", "IAS 21 introduction (ACCA Financial Reporting)", "OpenTuition"]],
    'ifrs13':[["OFwZv_mlb7w", "IFRS 13 fair value measurement summary", "Silvia of CPDbox"], ["4K0O2qTt-f4", "The fundamentals of IFRS 13", "ACCA"]],
    equation:[['hjvV5rG_3sY','Assets, liabilities & equity: explained in (almost) 2 minutes','Accounting Stuff'],['l80_QtI8nDQ','Accounting for beginners #1: the accounting equation','Kashif Official']],
    dcrules:[['H56STd1iu-w','Double entry “DEAD CLIC” & “DEAR CLIP”: 2 easy mnemonics','AQA Accounting Teacher'],['FK9CbIEaSCw','Debits and credits: DEAD CLIC (AAT Level 2)','AAT level 2 Basic explained']],
    journals:[['Y-_Q3rANyxU','How journal entries work (in accounting)','Accounting Stuff'],['kK7mU2Udf7M','Accounting for beginners: journal entries, debits and credits','CPA Strength']],
    taccounts:[['1JK1XoLCkZU','How to balance off accounts (balancing T-accounts with examples)','Will Boardman'],['3GoFWeUvC-Q','Balancing accounts (balance c/d and b/d)','Accounting Lecture']],
    tb:[['hzuJHNnmSRM','Trial balance: explained in (almost) 2 minutes','Accounting Stuff'],['3_PfoTzSCQE','The trial balance explained (full example)','Accounting Stuff']],
    adjustments:[['wILOexu2k9w','Accruals, deferred income, prepayments and accrued income explained','Rebecca’s Finance Tutorials'],['GlRHYn0PZ0g','ACCA FA: accruals, prepayments, accrued and deferred income','Got it Pass']],
    depreciation:[['ZyTMcTNlRd4','ACCA FA: depreciation, straight line method, example 1','OpenTuition'],['9jUFGgoGkt0','Straight line vs reducing balance depreciation: worked example','Kisembo Academy']],
    income:[['_FQEkuJAldM','Income statement & statement of financial position for a sole trader','Luke Fannon'],['-dPLqWYuT_k','Trial balance to income statement and statement of financial position','Deirdre Macnamara']],
    sofp:[['f9PMOoXjWdg','The statement of financial position explained: sole trader (full example)','Will Boardman'],['_FQEkuJAldM','Income statement & statement of financial position for a sole trader','Luke Fannon']],
    partnerships:[['2Tdmpnxg3D8','Partnership appropriation account','Accounting with Mr H'],['Rsfp5sqoqTw','Appropriation account: partnership (full example)','Counttuts']],
    incomplete:[['HC1medJkvcQ','Mark-up and margins: ACCA Financial Accounting (FA) lectures','OpenTuition'],['f5PkNvrsU2U','Incomplete records: using margin and mark-up','A Level Accounting: Study the easy way']]
,
    'fs-is':[['3optbF6sNCQ','Statement of profit or loss for a sole trader explained (with example)','Will Boardman'],['wcvyJhRUpno','Income statement: explained in (almost) 2 minutes','Accounting Stuff']],
    'fs-sofp':[['f9PMOoXjWdg','The statement of financial position explained: sole trader (full example)','Will Boardman'],['CMv1zlZhb4Q','The balance sheet for beginners (full example)','Accounting Stuff']],
    'fs-sopl':[['xP707e4UeIM','IAS 1: expenses by nature and by function, and other comprehensive income','Silvia of CPDbox'],['hrSUq4wcd0g','The income statement explained (profit & loss)','Accounting Stuff']],
    'fs-cosofp':[['CMv1zlZhb4Q','The balance sheet for beginners (full example)','Accounting Stuff'],['rUBWG6n1fMk','The balance sheet explained (beginner’s guide)','Corporate Finance Institute']],
    'fs-socie':[['YCVYSWD1jYc','Financial statements lecture 6: the statement of changes in equity (IFRS)','Else Grech Accounting'],['1Km1_znSodk','Preparing the statement of changes in equity','Tony Bell']],
    'fs-socf':[['5nl2mliT5ho','IAS 7 statement of cash flows (indirect method)','EZIKAN ACADEMY'],['9d6f8F8k-vw','Statement of cash flows, indirect method: question practice (ACCA FR)','Al Hamd Hyderabad']],
    'fs-consol':[['b4wPWVzKAZo','Group accounts: the consolidated statement of financial position (1a)','OpenTuition'],['76sfdBx9iqQ','Preparing the consolidated statement of financial position, part 1','OpenTuition']],
    'cashflow':[['XTyY3Rw5MSo','IAS 7 statement of cash flows (indirect method): FR and SBR','EZIKAN ACADEMY'],['9d6f8F8k-vw','Statement of cash flows, indirect method: question practice (ACCA FR)','Al Hamd Hyderabad']],
    'ratios':[['6YlY1OgaSgg','Financial ratios explained: profitability, liquidity and efficiency','SkillUp Smart'],['ocs8wasOzXo','ACCA FR: liquidity and solvency ratios, interpretation','FinanceSkul']],
    'ifrs':[['3S6ulr7qTiU','IAS 2 Inventories (part 1)','FOG Accountancy Tutorials'],['0Y6eR2AO-QM','Inventories IAS 2: lower of cost and net realisable value','ExpertAccounting']],
    'ias36':[['oQvFwe-7a_k','IAS 36 impairment of assets explained','Silvia of CPDbox'],['2BE-r2xjhyE','IAS 36: cash-generating unit worked example','Hybrid Accounts']],
    'ias12':[['Cwqk7tbhPhw','IAS 12 deferred tax (ACCA Financial Reporting)','OpenTuition'],['wPIC21GDjGY','IAS 12: how to calculate deferred tax, step by step','Silvia of CPDbox']],
    'ifrs9':[['bJw4ZTUpeQ0','Financial instruments: amortised cost example (ACCA FR)','OpenTuition'],['QSgghWk3x-4','IFRS 9: the amortised cost concept','Vertex Learning Solutions']],
    'ifrs15':[['G4Rik0MducE','IFRS 15 explained: the 5-step model with a telecom example','Silvia of CPDbox'],['E-cBZ_BR7_0','IFRS 15 explained: the 5-step model for revenue recognition','NextGen Ledger']],
    'ias37':[['KTC3YLD-p9k','IAS 37 provisions and contingent liabilities (ACCA FR)','OpenTuition'],['8UuH83Y0mM0','The fundamentals of IAS 37','ACCA']],
    'ias16':[['PqUasFaqVyI','IAS 16 revaluation of non-current assets','FinanceSkul'],['mD6eqvajHP4','Excess depreciation','Win Bo Myint Institute of Accountancy']],
    'ias38':[['I5qJr1HaA24','IAS 38 intangible assets (ACCA FR lecture 12)','Sabi Akther'],['6LjBRhPnIzo','IAS 38 intangible assets: research and development costs','Commerce Specialist']],
    'ifrs16':[['LHC-fa-nHtw','IFRS 16 lessee accounting','OpenTuition'],['I1E6OlcsRnU','IFRS 16 leases explained: lessee accounting and exemptions','Accounting Zero to Hero']],
    'consolpl':[['hFH0wctE9J0','Consolidated statement of profit or loss (ACCA FR lecture 25)','Sabi Akther'],['M9lCV4FHSas','Consolidated profit or loss: eliminating unrealised profit','AG OnlineTutor']],
    'audit':[['GqO29F6_ktw','Audit evidence (ACCA Audit and Assurance)','OpenTuition'],['TQRfLQkhXfw','Introduction to the ACCA Audit and Assurance exam','OpenTuition']],
    'bookkeeping':[['egGPXLirLdY','Bank reconciliation statement example','Hybrid Accounts'],['EeJ4GFxaMfY','VAT in the UK explained for beginners','SkillUp Smart']],
    'groups':[['b4wPWVzKAZo','Group accounts: the consolidated statement of financial position (1a)','OpenTuition'],['yLnkU-TDJVA','Group accounts: the consolidated statement of financial position (2c)','OpenTuition']],
    'interview':[['Jt6X4wWILiQ','Competency-based interview questions: the STAR technique','CareerVidz'],['YIxrSD-oe8w','10 technical accounting interview questions','Learn with Peps']],
    'excel':[['HtKubu7PNQQ','SUM, SUMIFS, IF, COUNTIF, XLOOKUP and VLOOKUP in Excel','Rameez khan'],['IHoDOr0g7Bw','Excel formulas for accountants: VLOOKUP and SUMIFS','Steve Chase']],
    'annualreport':[['7OjsEF04V8o','How to read an annual report (10-K) for beginners','Learn to Invest'],['LdXVwBzvaS0','How investors read annual reports','mStock']],
    'jobrec':[['AMi940VaUOA','Auditing accounts receivable, part 1: processes and controls','AmandaLovesToAudit'],['AJkNeELgqhI','Auditing accounts receivable, part 2: tests of controls and substantive procedures','AmandaLovesToAudit']],
    'jobcount':[['FlqaasApdNE','How to plan and conduct an inventory count when auditing inventory','Efiwe CPA'],['eL6olgFUjxQ','How to perform an inventory count observation','The AuditCast']],
    'jobclose':[['3W8Wu3fY7FU','How to do the month-end close: a step-by-step explainer','FloQast'],['d6vVJT5OlzM','The month-end close process for bookkeepers and accountants','Zach Pasquariello']],
    'jobtax':[['tpjCqzyoEq8','VAT explained in 5 minutes','Accounting Basics'],['V6vXLq5GJmk','UK corporation tax explained','Kaplan UK']],
    'jobgc':[['LhDrw8Vjz8I','ISA 570 going concern explained (ACCA Audit and Assurance)','FinTram Global'],['l9fUFhfRb7o','ISA 570: the auditor’s role in assessing going concern','Accounting BotCast']],
    'jobpay':[['v3X89Zr-m7w','Auditing payroll: tests of controls and substantive procedures','AmandaLovesToAudit'],['DbcdkplpGhA','Substantive analytical procedures for auditing payroll','Farhat Lectures']],
    'jobfa':[['Etn6cD1qX9c','How to audit property, plant and equipment: a practical approach','Efiwe CPA'],['hNkZ__afDKE','Capital vs revenue expenditure explained','Infomax Computer Academy']],
    'joblease':[['I1E6OlcsRnU','IFRS 16 leases explained: lessee accounting and exemptions','Accounting Zero to Hero'],['LHC-fa-nHtw','IFRS 16 lessee accounting','OpenTuition']]
  };

  /* ---------- player ---------- */
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function at(str,k){if(!str)return null;var r=null;str.split('|').forEach(function(p){var i=p.indexOf(':'),n=+p.slice(0,i);if(n<=k)r=p.slice(i+1);});return r;}
  function inList(str,k){return !!str&&str.split(',').some(function(x){return +x===k;});}
  var ICON={play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',prev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',again:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4"/></svg>'};

  /* numbers roll smoothly from the old value to the new one */
  var NUM=/^([^\d(\-−]*)(\(?)([\-−]?)([\d,]*\.?\d+)(\)?)(.*)$/;
  function parseN(str){var m=NUM.exec(String(str).trim());if(!m)return null;var raw=m[4].replace(/,/g,'');var dec=(raw.split('.')[1]||'').length;
    return {pre:m[1],par:m[2]==='('&&m[5]===')',neg:!!m[3],v:parseFloat(raw)*((m[3]||(m[2]==='('&&m[5]===')'))?-1:1),dec:dec,comma:/,/.test(m[4])||Math.abs(parseFloat(raw))>=10000,post:m[6]};}
  function fmtN(v,f){var a=Math.abs(v),s=a.toFixed(f.dec);if(f.comma){var p=s.split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');s=p.join('.');}
    if(v<0)s=f.par?'('+s+')':(f.neg?'−':'-')+s;return f.pre+s+f.post;}
  function roll(e,from,to){var b=parseN(to);if(!b)return false;var a=parseN(from);var v0=a&&a.pre===b.pre&&a.post===b.post?a.v:0;
    if(v0===b.v){e.textContent=to;return true;}
    var t0=performance.now(),D=Math.min(900,420+Math.log10(Math.abs(b.v-v0)+1)*90);e._roll=(e._roll||0)+1;var id=e._roll;
    e.classList.add('rolling');
    (function step(now){if(e._roll!==id)return;var p=Math.min(1,(now-t0)/D),q=1-Math.pow(1-p,3);
      e.textContent=p<1?fmtN(v0+(b.v-v0)*q,b):to;if(p<1)requestAnimationFrame(step);else e.classList.remove('rolling');})(t0);
    return true;}

  function build(host,id){var d=X[id];if(!d)return;var n=d.caps.length;
    host.innerHTML='<div class="xp"><div class="xp-top"><span class="xp-badge">Animated explainer</span><b>'+d.title+'</b><span class="xp-count"></span></div>'+
      '<div class="xp-stage" aria-hidden="true">'+d.stage+'</div>'+
      '<p class="xp-cap" aria-live="polite"></p>'+
      '<div class="xp-ctl"><button type="button" class="xp-b xp-prev" aria-label="Previous step">'+ICON.prev+'</button><button type="button" class="xp-b xp-play" aria-label="Play">'+ICON.play+'</button><button type="button" class="xp-b xp-next" aria-label="Next step">'+ICON.next+'</button>'+
      '<button type="button" class="xp-b xp-voice" aria-pressed="false" aria-label="Narrate with voice" title="Narrate"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 6a8.5 8.5 0 0 1 0 12"/></svg></button>'+
      '<div class="xp-seg">'+d.caps.map(function(_,i){return '<button type="button" aria-label="Go to step '+(i+1)+'"><i></i></button>';}).join('')+'</div></div></div>';
    var st=host.querySelector('.xp-stage'),cap=host.querySelector('.xp-cap'),cnt=host.querySelector('.xp-count'),pb=host.querySelector('.xp-play'),segs=[].slice.call(host.querySelectorAll('.xp-seg button'));
    var k=0,timer=0,playing=false,t0=0,dur=0,raf=0;
    /* rhythm: reading time for the caption, then hold longer on results and on the final step */
    function durFor(i){var c=d.caps[i],b=Math.max(2600,1350+c.length*36);if(/=|£\d|\d%/.test(c))b+=500;if(i===n-1)b+=1400;return b;}
    st.querySelectorAll('[data-t]').forEach(function(e){e._t0=e.textContent;});
    st.querySelectorAll('[data-h]').forEach(function(e){e._h0=e.style.height||'0%';});
    var first=true;
    function render(){
      var entering=[],els=[].slice.call(st.querySelectorAll('[data-s],[data-e],[data-hl],[data-t],[data-h]'));
      els.forEach(function(e){
        var s=e.getAttribute('data-s'),en=e.getAttribute('data-e');
        if(s!=null||en!=null){var on=(s==null||k>=+s)&&(en==null||k<=+en);var was=e.classList.contains('on');
          e.classList.toggle('on',on);e.classList.toggle('off',!on);
          if(on&&!was&&!first)entering.push(e);else if(!on)e.style.removeProperty('--xd');
          e._new=on&&(s!=null&&+s===k);}
        e.classList.toggle('hl',inList(e.getAttribute('data-hl'),k));
        var t=at(e.getAttribute('data-t'),k);if(t==null&&e.hasAttribute('data-t'))t=e._t0;
        if(t!=null&&(e._tt!=null?e._tt:e.textContent)!==t){var from=e._tt!=null?e._tt:e.textContent;e._tt=t;
          if(reduce||first){e.textContent=t;}else if(!roll(e,from,t)){e.textContent=t;e.classList.remove('flip');void e.offsetWidth;e.classList.add('flip');}}
        if(e.hasAttribute('data-h')){var h=at(e.getAttribute('data-h'),k);e.style.height=h!=null?h+'%':e._h0;}
      });
      /* overlapping entrances: each new item starts a beat after the one before */
      entering.forEach(function(e,i){e.style.setProperty('--xd',reduce?'0ms':Math.min(i*90,540)+'ms');});
      /* one idea per step: keep this step's items bright, quieten the rest */
      var focusSet=els.filter(function(e){return e.classList.contains('hl')||(e._new&&!e.closest('.off'));});
      var hasFocus=els.some(function(e){return e.classList.contains('hl');})&&k>0;
      els.forEach(function(e){var q=false;
        if(hasFocus&&e.classList.contains('on')&&!e.classList.contains('hl')&&!e._new){
          q=!focusSet.some(function(f){return f!==e&&(e.contains(f)||f.contains(e));});}
        e.classList.toggle('xq',q);});
      if(!first&&!reduce&&cap.textContent!==d.caps[k]){cap.classList.remove('capin');void cap.offsetWidth;cap.classList.add('capin');}
      first=false;
      cap.textContent=d.caps[k];cnt.textContent='Step '+(k+1)+' of '+n;
      segs.forEach(function(b,i){b.classList.toggle('done',i<k);b.classList.toggle('cur',i===k);b.querySelector('i').style.width=i<k?'100%':'0%';});
      host.querySelector('.xp-prev').disabled=k===0;host.querySelector('.xp-next').disabled=k===n-1;
    }
    function setPlay(p){playing=p;pb.innerHTML=p?ICON.pause:(k===n-1&&!p&&t0?ICON.again:ICON.play);pb.setAttribute('aria-label',p?'Pause':(k===n-1?'Play again':'Play'));host.classList.toggle('playing',p);}
    /* narration: speak each caption; while it plays, the step waits for the voice to finish */
    var vb=host.querySelector('.xp-voice'),narrate=false,spoken=true;
    try{narrate=localStorage.getItem('gs-narrate')==='1';}catch(e){}
    if(!window.GSTTS){vb.hidden=true;narrate=false;}
    function setNarr(on){narrate=on;vb.setAttribute('aria-pressed',on?'true':'false');vb.classList.toggle('on',on);vb.setAttribute('aria-label',on?'Turn narration off':'Narrate with voice');try{localStorage.setItem('gs-narrate',on?'1':'0');}catch(e){}if(!on&&window.GSTTS)GSTTS.hush();}
    setNarr(narrate);
    function speak(){if(!narrate||!window.GSTTS)return;spoken=false;var mine=k;GSTTS.say(d.caps[k],function(){if(mine===k){spoken=true;if(playing){var now=performance.now();dur=Math.min(dur,now-t0+650);}}});}
    vb.addEventListener('click',function(){setNarr(!narrate);if(narrate){if(!playing)play();else speak();}});
    function tick(now){if(!playing)return;var p=Math.min(1,(now-t0)/dur);
      if(narrate&&!spoken){p=Math.min(p,.96);if((now-t0)>dur)dur=(now-t0)+400;}
      var cur=segs[k].querySelector('i');cur.style.width=(p*100)+'%';
      if(p>=1){if(k<n-1){k++;render();t0=now;dur=narrate?Math.max(1800,durFor(k)*.6):durFor(k);speak();}else{cur.style.width='100%';setPlay(false);return;}}raf=requestAnimationFrame(tick);}
    function play(){if(k===n-1){k=0;render();}setPlay(true);t0=performance.now();dur=narrate?Math.max(1800,durFor(k)*.6):durFor(k);cancelAnimationFrame(raf);speak();raf=requestAnimationFrame(tick);}
    function stop(){setPlay(false);cancelAnimationFrame(raf);if(window.GSTTS)GSTTS.hush();spoken=true;}
    function go(i){stop();k=Math.max(0,Math.min(n-1,i));render();if(narrate)speak();}
    pb.addEventListener('click',function(){playing?stop():play();});
    host.querySelector('.xp-prev').addEventListener('click',function(){go(k-1);});
    host.querySelector('.xp-next').addEventListener('click',function(){go(k+1);});
    segs.forEach(function(b,i){b.addEventListener('click',function(){go(i);});});
    host.tabIndex=-1;
    host.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(k+1);e.preventDefault();}else if(e.key==='ArrowLeft'){go(k-1);e.preventDefault();}});
    render();
  }
  document.querySelectorAll('.expl[data-expl]').forEach(function(h){build(h,h.getAttribute('data-expl'));});

  /* ---------- videos ---------- */
  var inline=/netlify\.app$/.test(location.hostname)||location.protocol==='file:'||location.hostname==='localhost'||!/claude/.test(location.hostname);
  document.querySelectorAll('.vids[data-vids]').forEach(function(box){var list=V[box.getAttribute('data-vids')]||[];
    box.innerHTML=list.map(function(v){return '<a class="vid" href="https://www.youtube.com/watch?v='+v[0]+'" target="_blank" rel="noopener" data-yt="'+v[0]+'">'+
      '<span class="vid-th"><img src="https://i.ytimg.com/vi/'+v[0]+'/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="vid-pl">'+ICON.play+'</span></span>'+
      '<span class="vid-tx"><b>'+v[1]+'</b><small>'+v[2]+' · YouTube</small></span></a>';}).join('');
    if(inline)box.querySelectorAll('.vid').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var id=a.getAttribute('data-yt');
      var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';f.title=a.querySelector('b').textContent;f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;
      var dv=document.createElement('div');dv.className='vid playing';dv.innerHTML=a.innerHTML;var th=dv.querySelector('.vid-th');th.innerHTML='';th.append(f);a.replaceWith(dv);});});
  });
})();
