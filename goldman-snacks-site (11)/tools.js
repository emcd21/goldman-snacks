/* Goldman Snacks: exam questions, review list, flashcards and written practice.
   Loaded after site.js, so it can use el(), W, card(), fixed(), TOPICS, SLUG, numOk() and mark(). */
(function(){
const page=document.getElementById('page');const PID=page&&page.dataset.page;
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const LEVEL_NAME={f:'Foundations',fs:'Financial statements',y3:'Year 3',ind:'Industry ready',job:'On the job'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* =====================================================================
   1. EXAM-STYLE QUESTIONS
   ===================================================================== */
const F=(label,answer,m,o)=>Object.assign({label,answer,m:m||1},o||{});
const EXAM=[
{id:'consol-sofp',title:'Consolidated statement of financial position',topics:['fs-consol','groups'],marks:20,
 scen:`<p>On 1 January 20X4, Pine plc acquired 80,000 of the 100,000 £1 ordinary shares in Spruce Ltd for £250,000 in cash. At that date Spruce’s retained earnings were £60,000. The fair value of Spruce’s land was £20,000 more than its carrying amount. Non-controlling interest (NCI) is measured at fair value, which was £58,000 at acquisition.</p><p>At 31 December 20X5:</p><ul><li>Pine’s retained earnings were £400,000 and Spruce’s were £110,000.</li><li>Goodwill has been impaired by £10,000 since acquisition.</li><li>During the year Pine sold goods to Spruce for £30,000 at a mark-up of 25% on cost. One third of these goods are still in Spruce’s inventory.</li></ul>`,
 parts:[
  {l:'(a)',p:'Calculate the net assets of Spruce at acquisition and the goodwill arising.',type:'fields',fields:[F('Net assets at acquisition (£)',180000,2),F('Goodwill at acquisition (£)',128000,3)],ms:'Net assets = share capital 100,000 + retained earnings 60,000 + fair value uplift 20,000 = <b>180,000</b> (2).<br>Goodwill = consideration 250,000 + NCI 58,000 − net assets 180,000 = <b>128,000</b> (3).'},
  {l:'(b)',p:'Calculate goodwill at 31 December 20X5.',type:'fields',fields:[F('Goodwill at year end (£)',118000,1)],ms:'128,000 − impairment 10,000 = <b>118,000</b> (1).'},
  {l:'(c)',p:'Calculate the unrealised profit in inventory.',type:'fields',fields:[F('Unrealised profit (£)',2000,2)],ms:'Profit on the sale = 30,000 × 25/125 = 6,000 (1). One third is still held: 6,000 × ⅓ = <b>2,000</b> (1).'},
  {l:'(d)',p:'Calculate the non-controlling interest at 31 December 20X5.',type:'fields',fields:[F('NCI at year end (£)',66000,3)],ms:'NCI at acquisition 58,000 + 20% × post-acquisition profit (110,000 − 60,000 = 50,000) 10,000 − 20% × impairment 2,000 = <b>66,000</b> (3). The unrealised profit is on Pine’s sale, so it doesn’t affect the NCI.'},
  {l:'(e)',p:'Calculate group retained earnings at 31 December 20X5.',type:'fields',fields:[F('Group retained earnings (£)',430000,4)],ms:'Pine 400,000 (½) + 80% × 50,000 = 40,000 (1) − 80% × impairment 8,000 (1) − unrealised profit 2,000 (1) = <b>430,000</b> (½).'},
  {l:'(f)',p:'Explain why the unrealised profit is removed, and why intra-group receivables and payables are cancelled on consolidation.',type:'written',m:5,
   model:'The group is reported as a single economic entity. A sale from Pine to Spruce is a transfer within that entity, so the group has not earned any profit until the goods are sold to a customer outside the group. The profit on goods still held in inventory is therefore unrealised and is removed, which also reduces inventory to its cost to the group. For the same reason, amounts owed between Pine and Spruce are not assets or liabilities of the group: the group cannot owe money to itself, so intra-group receivables and payables are cancelled against each other.',
   points:['The group is treated as a single economic entity','Profit is only earned when goods are sold outside the group','The unrealised profit reduces group profit and inventory back to cost to the group','Intra-group receivables and payables cancel because the group cannot owe itself','Without these adjustments, assets, liabilities and profit would be overstated']}]},
{id:'consol-pl',title:'Consolidated statement of profit or loss',topics:['consolpl'],marks:15,
 scen:`<p>On 1 April 20X5, Hale plc acquired 75% of the ordinary shares of Kerr Ltd. The year end of both companies is 31 December 20X5. Profits accrue evenly through the year. Extracts for the full year:</p>`+
  `<div class="scroll"><table class="ledger simple"><thead><tr><th></th><th class="amt">Hale £</th><th class="amt">Kerr £</th></tr></thead><tbody><tr><td>Revenue</td><td class="amt">800,000</td><td class="amt">400,000</td></tr><tr><td>Cost of sales</td><td class="amt">(500,000)</td><td class="amt">(240,000)</td></tr><tr><td>Operating expenses</td><td class="amt">(120,000)</td><td class="amt">(60,000)</td></tr><tr><td>Tax</td><td class="amt">(40,000)</td><td class="amt">(20,000)</td></tr></tbody></table></div>`+
  `<p>Since acquisition, Kerr has sold goods to Hale for £40,000 at a gross margin of 25%. Half of these goods are still in Hale’s inventory at the year end.</p>`,
 parts:[
  {l:'(a)',p:'Calculate consolidated revenue.',type:'fields',fields:[F('Revenue (£)',1060000,3)],ms:'800,000 + 400,000 × 9/12 = 300,000 (1) − intra-group sales 40,000 (1) = <b>1,060,000</b> (1).'},
  {l:'(b)',p:'Calculate consolidated cost of sales, including the unrealised profit adjustment.',type:'fields',fields:[F('Unrealised profit (£)',5000,1),F('Cost of sales (£)',645000,3)],ms:'Unrealised profit = 40,000 × 25% × ½ = <b>5,000</b> (1).<br>Cost of sales = 500,000 + 240,000 × 9/12 = 180,000 (1) − 40,000 (1) + 5,000 = <b>645,000</b> (1).'},
  {l:'(c)',p:'Calculate consolidated profit for the year.',type:'fields',fields:[F('Profit for the year (£)',195000,3)],ms:'Gross profit 1,060,000 − 645,000 = 415,000. Operating expenses 120,000 + 60,000 × 9/12 = 165,000 (1). Tax 40,000 + 20,000 × 9/12 = 55,000 (1). Profit = 415,000 − 165,000 − 55,000 = <b>195,000</b> (1).'},
  {l:'(d)',p:'Split the profit for the year between the owners of Hale and the NCI.',type:'fields',fields:[F('Profit attributable to NCI (£)',13750,2),F('Profit attributable to owners of Hale (£)',181250,1)],ms:'Kerr’s post-acquisition profit = (400,000 − 240,000 − 60,000 − 20,000) × 9/12 = 60,000, less the unrealised profit 5,000 (Kerr was the seller) = 55,000. NCI = 25% × 55,000 = <b>13,750</b> (2). Owners = 195,000 − 13,750 = <b>181,250</b> (1).'},
  {l:'(e)',p:'Explain why only nine months of Kerr’s results are included.',type:'written',m:2,model:'Kerr only became a subsidiary on 1 April, when Hale gained control. Its income and expenses are included in the group accounts only from the date control was obtained, so nine months (April to December) are consolidated. Profits earned before that belong to the pre-acquisition period and are part of the net assets Hale paid for.',points:['Consolidate from the date control is gained','Pre-acquisition profits are part of the net assets acquired, not group profit']}]},
{id:'cashflow',title:'Statement of cash flows',topics:['cashflow','fs-socf'],marks:15,
 scen:`<p>Extracts from the accounts of Birch Ltd for the year ended 31 December 20X5:</p><ul><li>Profit before tax £120,000, after finance costs of £8,000 (all paid in the year) and a £5,000 profit on disposal of equipment.</li><li>Depreciation for the year was £30,000.</li><li>Inventory rose by £12,000, trade receivables fell by £6,000 and trade payables rose by £4,000.</li><li>The tax liability was £20,000 at the start of the year and £22,000 at the end. The tax charge for the year was £25,000.</li><li>Property, plant and equipment (carrying amount) was £300,000 at the start and £340,000 at the end. During the year, equipment with a carrying amount of £15,000 was sold for £20,000, and land was revalued upwards by £10,000.</li></ul>`,
 parts:[
  {l:'(a)',p:'Calculate cash generated from operations (indirect method).',type:'fields',fields:[F('Cash generated from operations (£)',151000,5)],ms:'Profit before tax 120,000 + depreciation 30,000 (1) − profit on disposal 5,000 (1) + finance costs 8,000 (1) − increase in inventory 12,000 + decrease in receivables 6,000 + increase in payables 4,000 (1) = <b>151,000</b> (1).'},
  {l:'(b)',p:'Calculate tax paid.',type:'fields',fields:[F('Tax paid (£)',23000,2)],ms:'Opening 20,000 + charge 25,000 − closing 22,000 = <b>23,000</b> (2).'},
  {l:'(c)',p:'Calculate net cash from operating activities.',type:'fields',fields:[F('Net cash from operating activities (£)',120000,2)],ms:'151,000 − interest paid 8,000 − tax paid 23,000 = <b>120,000</b> (2).'},
  {l:'(d)',p:'Calculate the cash paid for new property, plant and equipment, and net cash used in investing activities.',type:'fields',fields:[F('Purchases of PPE (£)',75000,3),F('Net cash used in investing activities (£)',55000,1)],ms:'Closing 340,000 = opening 300,000 + revaluation 10,000 − depreciation 30,000 − disposal 15,000 + purchases, so purchases = <b>75,000</b> (3).<br>Investing = purchases (75,000) + proceeds 20,000 = <b>(55,000)</b> (1).'},
  {l:'(e)',p:'Explain why depreciation is added back to profit.',type:'written',m:2,model:'Depreciation is an expense that reduces profit but involves no cash leaving the business. The cash left when the asset was bought, and that is shown in investing activities. So depreciation is added back to reconcile profit to the cash actually generated by operations.',points:['Depreciation is a non-cash expense','The cash outflow is shown when the asset is bought, in investing activities']}]},
{id:'ratios',title:'Ratio analysis and interpretation',topics:['ratios'],marks:15,
 scen:`<p>Extracts for Alder plc:</p><div class="scroll"><table class="ledger simple"><thead><tr><th></th><th class="amt">20X5 £000</th><th class="amt">20X4 £000</th></tr></thead><tbody><tr><td>Revenue</td><td class="amt">2,000</td><td class="amt">1,600</td></tr><tr><td>Gross profit</td><td class="amt">600</td><td class="amt">560</td></tr><tr><td>Operating profit</td><td class="amt">200</td><td class="amt">240</td></tr></tbody></table></div><p>At 31 December 20X5: inventory £200,000, trade receivables £250,000, cash £50,000, current liabilities £250,000, equity £600,000 and non-current loans £400,000.</p>`,
 parts:[
  {l:'(a)',p:'Calculate the gross profit margin and operating profit margin for both years (as percentages).',type:'fields',fields:[F('Gross margin 20X5 (%)',30,1),F('Gross margin 20X4 (%)',35,1),F('Operating margin 20X5 (%)',10,1),F('Operating margin 20X4 (%)',15,1)],ms:'Gross: 600/2,000 = <b>30%</b>; 560/1,600 = <b>35%</b>. Operating: 200/2,000 = <b>10%</b>; 240/1,600 = <b>15%</b>. (1 each)'},
  {l:'(b)',p:'Calculate these ratios for 20X5.',type:'fields',fields:[F('Return on capital employed (%)',20,1),F('Current ratio (: 1)',2,1,{tol:.05}),F('Quick ratio (: 1)',1.2,1,{tol:.05}),F('Receivables collection period (days, 1 dp)',45.6,1,{tol:.1}),F('Gearing: debt ÷ (debt + equity) (%)',40,1)],ms:'ROCE = 200 ÷ (600 + 400) = <b>20%</b>. Current = 500 ÷ 250 = <b>2.0</b>. Quick = (500 − 200) ÷ 250 = <b>1.2</b>. Receivables days = 250 ÷ 2,000 × 365 = <b>45.6 days</b>. Gearing = 400 ÷ 1,000 = <b>40%</b>. (1 each)'},
  {l:'(c)',p:'Comment on Alder’s performance and position.',type:'written',m:6,model:'Revenue grew by 25%, but gross margin fell from 35% to 30%, suggesting Alder cut prices to win sales or faced higher purchase costs. Operating margin fell further, from 15% to 10%, so operating expenses also grew faster than revenue, and operating profit actually fell despite the extra sales. ROCE of 20% is still reasonable. Liquidity looks comfortable: a current ratio of 2.0 and quick ratio of 1.2 mean short-term debts are covered. Receivables days of about 46 should be compared with credit terms. Gearing of 40% is moderate but interest costs will add to the pressure on profit. More information, such as industry averages, would help.',
   points:['Revenue growth of 25% identified','Falling gross margin explained (price cuts or higher costs)','Operating costs growing faster than revenue; operating profit fell','Liquidity assessed using current and quick ratios','Comments on receivables days or gearing','Reaches a conclusion or notes the limits of the data']}]},
{id:'ppe-impair',title:'IAS 16 revaluation and IAS 36 impairment',topics:['ias16','ias36'],marks:15,
 scen:`<p>Oak Ltd bought a building on 1 January 20X1 for £500,000, with a useful life of 50 years and no residual value. On 1 January 20X6 the building was revalued to £540,000; its remaining life was unchanged at 45 years. Oak transfers excess depreciation from the revaluation surplus to retained earnings each year.</p><p>At 31 December 20X6 there are signs of impairment. The building’s fair value less costs of disposal is £480,000 and its value in use is £470,000.</p>`,
 parts:[
  {l:'(a)',p:'Calculate the carrying amount before the revaluation and the revaluation surplus.',type:'fields',fields:[F('Carrying amount at 1 Jan 20X6 (£)',450000,1),F('Revaluation surplus (£)',90000,2)],ms:'500,000 − 5 × 10,000 = <b>450,000</b> (1). Surplus = 540,000 − 450,000 = <b>90,000</b>, to OCI (2).'},
  {l:'(b)',p:'Calculate the depreciation for 20X6 and the excess depreciation transfer.',type:'fields',fields:[F('Depreciation for 20X6 (£)',12000,2),F('Excess depreciation transfer (£)',2000,2)],ms:'540,000 ÷ 45 = <b>12,000</b> (2). Excess = 12,000 − original 10,000 = <b>2,000</b> (2).'},
  {l:'(c)',p:'Calculate the impairment loss and show where it is recognised.',type:'fields',fields:[F('Carrying amount at 31 Dec 20X6 (£)',528000,1),F('Recoverable amount (£)',480000,1),F('Impairment loss (£)',48000,1),F('Charged to OCI (£)',48000,1),F('Charged to profit or loss (£)',0,1)],ms:'Carrying amount 540,000 − 12,000 = <b>528,000</b> (1). Recoverable amount = higher of 480,000 and 470,000 = <b>480,000</b> (1). Loss = <b>48,000</b> (1). Surplus left = 90,000 − 2,000 = 88,000, so the whole loss goes to OCI (<b>48,000</b>) (1) and <b>nil</b> to profit or loss (1).'},
  {l:'(d)',p:'Explain why this impairment is charged against the revaluation surplus.',type:'written',m:3,model:'Under IAS 36, an impairment of a revalued asset is treated as a revaluation decrease. It is first set against any revaluation surplus for that same asset, through other comprehensive income, because it reverses a gain that was previously recognised there. Only an impairment larger than the surplus is charged to profit or loss.',points:['Impairment of a revalued asset is a revaluation decrease','It is set against the surplus on the same asset, through OCI','Any excess over the surplus goes to profit or loss']}]},
{id:'lease',title:'IFRS 16 lease',topics:['ifrs16'],marks:15,
 scen:`<p>On 1 January 20X5, Elm plc leased a machine for 5 years. It pays £20,000 at the end of each year. The interest rate implicit in the lease is 8%, and the 5-year annuity factor at 8% is 3.9927. Elm paid initial direct costs of £1,146. The machine is depreciated over the lease term. Round to the nearest £.</p>`,
 parts:[
  {l:'(a)',p:'Calculate the initial lease liability and right-of-use asset.',type:'fields',fields:[F('Lease liability (£)',79854,2,{tol:1}),F('Right-of-use asset (£)',81000,1,{tol:1})],ms:'20,000 × 3.9927 = <b>79,854</b> (2). Asset = 79,854 + 1,146 = <b>81,000</b> (1).'},
  {l:'(b)',p:'Calculate the interest for 20X5 and the liability at 31 December 20X5 and 20X6.',type:'fields',fields:[F('Interest 20X5 (£)',6388,1,{tol:1}),F('Liability at 31 Dec 20X5 (£)',66242,1,{tol:1}),F('Liability at 31 Dec 20X6 (£)',51541,2,{tol:2})],ms:'79,854 × 8% = <b>6,388</b> (1). 79,854 + 6,388 − 20,000 = <b>66,242</b> (1). 66,242 × 8% = 5,299; 66,242 + 5,299 − 20,000 = <b>51,541</b> (2).'},
  {l:'(c)',p:'Show the current and non-current liability at 31 December 20X5, and the total charge to profit or loss for 20X5.',type:'fields',fields:[F('Non-current liability (£)',51541,1,{tol:2}),F('Current liability (£)',14701,2,{tol:2}),F('Depreciation 20X5 (£)',16200,1),F('Total charge to profit or loss (£)',22588,1,{tol:1})],ms:'Non-current = the balance after next year’s payment = <b>51,541</b> (1). Current = 66,242 − 51,541 = <b>14,701</b> (2). Depreciation = 81,000 ÷ 5 = <b>16,200</b> (1). Total = 16,200 + 6,388 = <b>22,588</b> (1).'},
  {l:'(d)',p:'Explain the exemptions IFRS 16 allows for lessees, and how exempt leases are accounted for.',type:'written',m:3,model:'A lessee can choose not to recognise a right-of-use asset and lease liability for short-term leases (a lease term of 12 months or less, with no purchase option) and for leases of low-value assets, such as laptops or phones. For these, the lease payments are simply charged as an expense, usually on a straight-line basis over the lease term.',points:['Short-term leases: 12 months or less','Low-value assets, with an example','Payments expensed on a straight-line basis']}]},
{id:'revenue',title:'IFRS 15 revenue',topics:['ifrs15'],marks:15,
 scen:`<p>On 1 July 20X5, Ash Ltd sold a machine to a customer together with two years of servicing, for a total price of £100,000 paid in full on that date. The machine was delivered on 1 July. Ash sells the machine alone for £90,000 and the two-year service contract alone for £30,000. Ash’s year end is 31 December.</p>`,
 parts:[
  {l:'(a)',p:'Allocate the transaction price to the two performance obligations.',type:'fields',fields:[F('Machine (£)',75000,2),F('Servicing (£)',25000,2)],ms:'Total standalone prices = 120,000. Machine = 100,000 × 90/120 = <b>75,000</b> (2). Servicing = 100,000 × 30/120 = <b>25,000</b> (2).'},
  {l:'(b)',p:'Calculate revenue for the year ended 31 December 20X5 and the contract liability at that date.',type:'fields',fields:[F('Revenue for 20X5 (£)',81250,2),F('Contract liability (£)',18750,2)],ms:'Machine revenue at a point in time, on delivery: 75,000. Servicing over time: 25,000 × 6/24 = 6,250. Revenue = <b>81,250</b> (2). Contract liability = 25,000 − 6,250 = <b>18,750</b> (2).'},
  {l:'(c)',p:'Set out the five steps of IFRS 15 and explain how the servicing is recognised.',type:'written',m:7,model:'IFRS 15 uses five steps: (1) identify the contract with the customer; (2) identify the separate performance obligations, here the machine and the servicing; (3) determine the transaction price, £100,000; (4) allocate the price to each obligation using relative standalone selling prices; (5) recognise revenue when, or as, each obligation is satisfied. The servicing is provided evenly over two years, so it is satisfied over time and recognised month by month. Cash received in advance for servicing not yet provided is a contract liability.',points:['Step 1: identify the contract','Step 2: identify performance obligations (machine and servicing)','Step 3: determine the transaction price','Step 4: allocate using standalone selling prices','Step 5: recognise when or as obligations are satisfied','Servicing is recognised over time','Unearned servicing is a contract liability']}]},
{id:'deferred-tax',title:'IAS 12 deferred tax',topics:['ias12'],marks:10,
 scen:`<p>At 31 December 20X5, Beech Ltd owns equipment with a carrying amount of £80,000 and a tax base of £50,000. The tax rate is 25%. The deferred tax liability at 1 January 20X5 was £5,000. Current tax for 20X5 is estimated at £40,000.</p>`,
 parts:[
  {l:'(a)',p:'Calculate the temporary difference and the deferred tax liability at 31 December 20X5.',type:'fields',fields:[F('Taxable temporary difference (£)',30000,1),F('Deferred tax liability (£)',7500,2)],ms:'80,000 − 50,000 = <b>30,000</b> (1). × 25% = <b>7,500</b> (2).'},
  {l:'(b)',p:'Calculate the deferred tax charge and the total tax expense for the year.',type:'fields',fields:[F('Deferred tax charge (£)',2500,2),F('Total tax expense (£)',42500,2)],ms:'7,500 − 5,000 = <b>2,500</b> (2). 40,000 + 2,500 = <b>42,500</b> (2).'},
  {l:'(c)',p:'Explain why a deferred tax liability arises here.',type:'written',m:3,model:'Tax allowances on the equipment have been claimed faster than depreciation has been charged, so its carrying amount is higher than its tax base. The difference is temporary: in future years the company will earn profits from the asset but have fewer tax allowances left, so it will pay more tax. IAS 12 recognises that future tax now, as a liability, so the tax charge is matched with the accounting profit.',points:['Tax allowances claimed faster than depreciation','Carrying amount above tax base = taxable temporary difference','More tax will be paid in future, matching tax with accounting profit']}]},
{id:'provisions-events',title:'IAS 37 provisions and IAS 10 events',topics:['ias37','ias10'],marks:10,
 scen:`<p>Cedar Ltd’s year end is 31 December 20X5 and its accounts will be approved on 20 March 20X6.</p><ul><li>Cedar sold 10,000 products with a one-year warranty. It expects 70% to need no repair, 25% to need minor repairs costing £40 each and 5% to need major repairs costing £300 each. The warranty provision at 1 January 20X5 was £180,000.</li><li>A customer is suing Cedar. Its lawyers say Cedar will probably lose and the best estimate of the payment is £400,000.</li></ul>`,
 parts:[
  {l:'(a)',p:'Calculate the warranty provision, the charge to profit or loss, and the legal provision.',type:'fields',fields:[F('Warranty provision at 31 Dec 20X5 (£)',250000,2),F('Increase charged to profit or loss (£)',70000,1),F('Legal claim provision (£)',400000,1)],ms:'10,000 × [(25% × 40) + (5% × 300)] = 10,000 × 25 = <b>250,000</b> (2). Increase = 250,000 − 180,000 = <b>70,000</b> (1). The legal claim is probable, so provide the best estimate, <b>400,000</b> (1).'},
  {l:'(b)',p:'Classify each event after the reporting period.',type:'classify',m:3,options:['Adjusting','Non-adjusting'],items:[['A customer owing £15,000 at the year end is declared bankrupt in February','Adjusting'],['A flood damages a warehouse in January','Non-adjusting'],['Inventory held at the year end is sold in February for less than cost','Adjusting']],ms:'Bankruptcy: <b>adjusting</b>, the debt was already bad at the year end (1). Flood: <b>non-adjusting</b>, a new event, disclosed if material (1). Sale below cost: <b>adjusting</b>, evidence of net realisable value at the year end (1).'},
  {l:'(c)',p:'Explain how the legal claim would be treated if a payment were only possible, not probable.',type:'written',m:3,model:'If a payment is possible but not probable, there is no provision. Instead it is a contingent liability, disclosed in the notes with a description of the claim and an estimate of its financial effect. If the chance of payment were remote, nothing would be disclosed.',points:['No provision is recognised','Disclose as a contingent liability in the notes','Remote: no disclosure']}]},
{id:'eps',title:'IAS 33 earnings per share',topics:['ias33'],marks:10,
 scen:`<p>Fir plc’s profit after tax for the year ended 31 December 20X5 was £2,400,000. It paid £200,000 of dividends on irredeemable preference shares. On 1 January 20X5 it had 8,000,000 ordinary shares. It issued 2,000,000 shares at full market price on 1 July 20X5 and made a 1 for 5 bonus issue on 1 October 20X5. Reported EPS for 20X4 was 22.0p.</p>`,
 parts:[
  {l:'(a)',p:'Calculate earnings for EPS and the weighted average number of shares.',type:'fields',fields:[F('Earnings (£)',2200000,1),F('Weighted average shares',10800000,3)],ms:'2,400,000 − 200,000 = <b>2,200,000</b> (1).<br>8,000,000 × 6/12 × 6/5 = 4,800,000; 10,000,000 × 3/12 × 6/5 = 3,000,000; 12,000,000 × 3/12 = 3,000,000. Total <b>10,800,000</b> (3).'},
  {l:'(b)',p:'Calculate basic EPS for 20X5 and the restated EPS for 20X4.',type:'fields',fields:[F('Basic EPS 20X5 (pence, 2 dp)',20.37,2,{tol:.02}),F('Restated EPS 20X4 (pence, 2 dp)',18.33,1,{tol:.02})],ms:'2,200,000 ÷ 10,800,000 = <b>20.37p</b> (2). 22.0 × 5/6 = <b>18.33p</b> (1).'},
  {l:'(c)',p:'Explain why the 20X4 EPS is restated.',type:'written',m:3,model:'A bonus issue gives shareholders extra shares without any cash coming in, so the company’s resources and earning power don’t change. It is treated as if it had always happened, so the shares for the whole of this year and the previous year are adjusted by the bonus fraction. Restating last year’s EPS keeps the two years comparable.',points:['A bonus issue brings in no new resources','Treated as if it had always happened, using the bonus fraction','Restating keeps the two years comparable']}]}
];
window.GS_EXAM=EXAM;
const EXKEY='ledgerlab-exam';
function mins(m){return Math.round(m*1.8);}
function examList(root){
  const best=LS.get(EXKEY,{});
  const tot=EXAM.reduce((a,q)=>a+q.marks,0);
  root.append(el('p',{class:'hint',html:`${EXAM.length} questions, ${tot} marks in all. Each question has a time limit of 1.8 minutes per mark, the pace of an ACCA exam.`}));
  const grid=el('div',{class:'ex-grid'});
  EXAM.forEach((q,i)=>{const b=best[q.id];
    grid.append(el('a',{class:'ex-card',href:'#'+q.id},el('small',{text:'Question '+(i+1)}),el('b',{text:q.title}),
      el('span',{class:'ex-meta',html:`${q.marks} marks · ${mins(q.marks)} minutes`}),
      el('span',{class:'ex-best',html:b?`Best score: <b>${b.s} / ${q.marks}</b>`:'Not attempted yet'})));});
  root.append(grid);
}
function examQuestion(root,q){
  const idx=EXAM.indexOf(q);
  const back=el('a',{class:'ex-back',href:'#',text:'← All exam questions'});
  const timeEl=el('b',{class:'ex-time',text:fmtT(mins(q.marks)*60)});
  const startBtn=el('button',{class:'btn',type:'button',text:'Start timer'});
  const resetBtn=el('button',{class:'ghost',type:'button',text:'Reset'});
  const bar=el('div',{class:'ex-bar'},el('i'));
  let left=mins(q.marks)*60,iv=null,finished=false;
  function fmtT(s){const neg=s<0;s=Math.abs(s);return (neg?'+':'')+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
  function tick(){left--;show();}
  function show(){timeEl.textContent=fmtT(left);const tot=mins(q.marks)*60;bar.firstChild.style.width=Math.max(0,Math.min(100,100*(tot-left)/tot))+'%';timer.classList.toggle('over',left<0);timer.classList.toggle('low',left>=0&&left<tot*0.15);}
  startBtn.onclick=()=>{if(iv){clearInterval(iv);iv=null;startBtn.textContent='Resume';}else{iv=setInterval(tick,1000);startBtn.textContent='Pause';}};
  resetBtn.onclick=()=>{clearInterval(iv);iv=null;left=mins(q.marks)*60;startBtn.textContent='Start timer';show();};
  const timer=el('div',{class:'ex-timer'},el('div',{class:'ex-tl'},el('span',{text:'Time left'}),timeEl),bar,el('div',{class:'ex-tb'},startBtn,resetBtn));
  root.append(back,el('div',{class:'ex-head'},el('div',{},el('div',{class:'eyebrow',text:`Exam question ${idx+1} of ${EXAM.length} · ${q.marks} marks · ${mins(q.marks)} minutes`}),el('h2',{text:q.title}),
    el('p',{class:'hint',html:'Revise: '+q.topics.filter(t=>SLUG[t]).map(t=>{const tp=TOPICS.find(x=>x.id===t);return `<a href="${SLUG[t]}">${tp?tp.title:t}</a>`;}).join(' · ')})),timer));
  root.append(el('div',{class:'ex-scen prose',html:q.scen}));
  const parts=q.parts.map(p=>renderPart(p));
  parts.forEach(p=>root.append(p.el));
  const result=el('div',{class:'ex-result',hidden:true});
  const finish=el('button',{class:'btn',type:'button',text:'Finish and mark'});
  const again=el('button',{class:'ghost',type:'button',text:'Try again',onclick:()=>{clearInterval(iv);render();window.scrollTo(0,0);}});
  const next=idx<EXAM.length-1?el('a',{class:'ghost btnlink',href:'#'+EXAM[idx+1].id,text:'Next question →'}):null;
  root.append(el('div',{class:'ex-actions'},finish,again,next),result);
  function score(){return parts.reduce((a,p)=>a+p.score(),0);}
  function upd(){const s=Math.round(score()*2)/2;const hasW=q.parts.some(p=>p.type==='written');
    result.innerHTML=`<p class="ex-score"><b>${s} / ${q.marks}</b> marks${left<0?` · ${fmtT(-left)} over time`:''}</p><p class="hint">${hasW?'Written parts are marked by you: tick each point your answer made. ':''}The mark scheme is shown under each part.</p>`;
    const b=LS.get(EXKEY,{});if(!b[q.id]||s>b[q.id].s){b[q.id]={s,at:Date.now()};LS.set(EXKEY,b);}}
  finish.onclick=()=>{if(!finished){finished=true;clearInterval(iv);iv=null;startBtn.disabled=true;}parts.forEach(p=>p.mark(upd));result.hidden=false;upd();finish.textContent='Mark again';result.scrollIntoView({behavior:'smooth',block:'center'});};
  function render(){root.innerHTML='';examQuestion(root,q);}
  back.onclick=e=>{e.preventDefault();clearInterval(iv);location.hash='';};
  window.__exStop=()=>clearInterval(iv);
}
function renderPart(p){
  const box=el('section',{class:'ex-part'});
  const pm=p.type==='written'||p.type==='classify'?p.m:p.fields.reduce((a,f)=>a+f.m,0);
  box.append(el('div',{class:'ex-ph'},el('b',{text:p.l}),el('p',{html:p.p}),el('span',{class:'ex-m',text:pm+(pm===1?' mark':' marks')})));
  const ms=el('div',{class:'ex-ms',hidden:true},el('b',{text:'Mark scheme'}),el('p',{html:p.ms||''}));
  const got=el('span',{class:'ex-got',hidden:true});
  let score=()=>0,markFn;
  if(p.type==='fields'){
    const rows=p.fields.map(f=>{const inp=el('input',{class:'num',type:'text',inputmode:'decimal',autocomplete:'off','aria-label':f.label});return {f,inp,tr:el('tr',{},el('td',{html:f.label}),el('td',{class:'amt-in'},inp))};});
    box.append(el('div',{class:'scroll'},el('table',{class:'ledger fields'},el('tbody',{},rows.map(r=>r.tr)))));
    markFn=()=>{let s=0;rows.forEach(r=>{const ok=numOk(r.inp.value,r.f);mark(r.inp,ok);if(ok)s+=r.f.m;});score=()=>s;};
  }else if(p.type==='classify'){
    const sels=p.items.map(([l,a])=>{const s=el('select',{'aria-label':l},el('option',{value:'',text:'Choose…'}),p.options.map(o=>el('option',{value:o,text:o})));return {a,s,tr:el('tr',{},el('td',{html:l}),el('td',{},s))};});
    box.append(el('div',{class:'scroll'},el('table',{class:'ledger fields'},el('tbody',{},sels.map(r=>r.tr)))));
    markFn=()=>{let n=0;sels.forEach(r=>{const ok=r.s.value===r.a;mark(r.s,ok);if(ok)n++;});const s=Math.floor(p.m*n/sels.length*2)/2;score=()=>s;};
  }else{
    const ta=el('textarea',{'aria-label':'Your answer',placeholder:'Write your answer here.'});
    const boxes=p.points.map(()=>el('input',{type:'checkbox'}));
    const out=el('div',{class:'ex-self',hidden:true},el('div',{class:'model'},el('b',{text:'Model answer'}),el('p',{html:p.model})),el('p',{html:`<b>Tick each point your answer made</b> (1 mark each, up to ${p.m}):`}),el('div',{class:'points'},p.points.map((t,i)=>el('label',{},boxes[i],el('span',{html:t})))));
    box.append(ta,out);
    let cb=null;boxes.forEach(b=>b.addEventListener('change',()=>{got.textContent=score()+' / '+p.m;cb&&cb();}));
    score=()=>Math.min(p.m,boxes.filter(b=>b.checked).length);
    markFn=(u)=>{cb=u;out.hidden=false;};
  }
  box.append(got,ms);
  return {el:box,score:()=>score(),mark(u){markFn(u);ms.hidden=false;got.hidden=false;got.textContent=score()+' / '+pm;}};
}
function examPage(){
  const root=document.getElementById('exam-root');if(!root)return;
  function route(){window.__exStop&&window.__exStop();root.innerHTML='';const id=location.hash.slice(1);const q=EXAM.find(x=>x.id===id);
    if(q){examQuestion(root,q);}else examList(root);window.scrollTo(0,0);}
  window.addEventListener('hashchange',route);route();
}

/* =====================================================================
   2. REVIEW MY MISTAKES
   ===================================================================== */
function reviewPage(){
  const root=document.getElementById('review-root');if(!root)return;
  function draw(){
    root.innerHTML='';
    const o=revLoad();const keys=Object.keys(o).filter(k=>{const [t,i]=k.split(':');const tp=TOPICS.find(x=>x.id===t);return tp&&tp.practice[+i];});
    if(!keys.length){root.append(el('div',{class:'empty-note'},el('b',{text:'Nothing to review.'}),el('p',{html:'When you get a question wrong, or press <b>Show answer</b>, it’s added here so you can try it again later. Get it right here and it drops off the list.'}),el('p',{html:'<a href="index.html#year3">Go to the topics</a> or try an <a href="exam.html">exam question</a>.'})));return;}
    const order=TOPICS.map(t=>t.id);
    keys.sort((a,b)=>{const [ta,ia]=a.split(':'),[tb,ib]=b.split(':');return order.indexOf(ta)-order.indexOf(tb)||ia-ib;});
    const clear=el('button',{class:'ghost',type:'button',text:'Clear the list',onclick:()=>{if(confirm('Remove every question from your review list?')){revSave({});draw();}}});
    root.append(el('div',{class:'rv-top'},el('p',{html:`<b>${keys.length}</b> question${keys.length>1?'s':''} to try again, across <b>${new Set(keys.map(k=>k.split(':')[0])).size}</b> topic${new Set(keys.map(k=>k.split(':')[0])).size>1?'s':''}. Questions with new numbers will look different this time.`}),clear));
    let cur=null;
    keys.forEach(k=>{const [t,i]=k.split(':');const tp=TOPICS.find(x=>x.id===t);
      if(cur!==t){cur=t;root.append(el('h2',{class:'rv-h'},el('span',{text:tp.title}),el('small',{text:LEVEL_NAME[tp.level]||''}),el('a',{href:(SLUG[t]||'#')+'#learn',text:'Revise the topic'})));}
      const n=o[k].n||1;
      const c=card(t,tp.practice[+i],(tp.level==='job'?'Task ':'Question ')+(+i+1)+(n>1?` · missed ${n} times`:''),r=>{if(r===true){c.classList.add('rv-done');const h=c.querySelector('.q-head');if(!h.querySelector('.rv-ok'))h.append(el('span',{class:'rv-ok',text:'Off your list'}));}});
      root.append(c);});
  }
  draw();
}

/* =====================================================================
   3. FLASHCARDS (Leitner boxes)
   ===================================================================== */
function flashPage(){
  const root=document.getElementById('flash-root');if(!root||!window.GS_DECK)return;
  const KEY='ledgerlab-cards',DAY=864e5,GAP=[1,2,4,8,16];
  const deck=window.GS_DECK;let st=LS.get(KEY,{});
  let filter='all',size=20,queue=[],cur=null,done=0,flipped=false;
  const now=()=>Date.now();
  const inF=c=>filter==='all'||c.l===filter;
  function counts(){const d=deck.filter(inF);const c={new:0,due:0,box:[0,0,0,0,0]};d.forEach(x=>{const s=st[x.t];if(!s)c.new++;else{c.box[s.b-1]++;if(s.d<=now())c.due++;}});c.total=d.length;return c;}
  const statsEl=el('div',{class:'fc-stats'});
  const fSel=el('select',{'aria-label':'Section'},[['all','All sections'],['f','Foundations'],['fs','Financial statements'],['y3','Year 3'],['ind','Industry ready'],['job','On the job']].map(([v,t])=>el('option',{value:v,text:t})));
  const nSel=el('select',{'aria-label':'New cards'},[10,20,30,50].map(n=>el('option',{value:n,text:n+' new cards'})));nSel.value='20';
  const startBtn=el('button',{class:'btn',type:'button',text:'Start session'});
  const resetBtn=el('button',{class:'ghost',type:'button',text:'Reset progress'});
  const setup=el('div',{class:'fc-setup'},el('div',{class:'t-fields'},el('label',{},el('span',{text:'Section'}),fSel),el('label',{},el('span',{text:'New cards per session'}),nSel)),el('div',{class:'fc-btns'},startBtn,resetBtn));
  const stage=el('div',{class:'fc-stage',hidden:true});
  root.append(statsEl,setup,stage);
  function drawStats(){const c=counts();const mx=Math.max(1,...c.box);
    statsEl.innerHTML='';
    statsEl.append(el('div',{class:'fc-nums'},...[['Due now',c.due],['New',c.new],['Learning',c.box[0]+c.box[1]+c.box[2]],['Mastered',c.box[3]+c.box[4]],['Cards',c.total]].map(([l,v])=>el('div',{},el('b',{text:String(v)}),el('span',{text:l})))),
      el('div',{class:'fc-boxes','aria-label':'Cards in each box'},...c.box.map((v,i)=>el('div',{class:'fc-box'},el('i',{style:`height:${8+92*v/mx}%`}),el('b',{text:String(v)}),el('span',{text:'Box '+(i+1)})))),
      el('p',{class:'hint',text:'Box 1 cards come back tomorrow, box 2 in 2 days, then 4, 8 and 16 days. Get a card wrong and it goes back to box 1.'}));}
  fSel.onchange=()=>{filter=fSel.value;drawStats();};
  resetBtn.onclick=()=>{if(confirm('Forget all flashcard progress?')){st={};LS.set(KEY,st);drawStats();}};
  startBtn.onclick=()=>{size=+nSel.value;const d=deck.filter(inF);
    const due=d.filter(x=>st[x.t]&&st[x.t].d<=now()).sort((a,b)=>st[a.t].d-st[b.t].d);
    const fresh=shuffle(d.filter(x=>!st[x.t])).slice(0,size);
    queue=due.concat(fresh);done=0;
    if(!queue.length){stage.hidden=false;stage.innerHTML='';stage.append(el('div',{class:'empty-note'},el('b',{text:'All caught up.'}),el('p',{text:'No cards are due in this section. Come back tomorrow, or pick another section.'})));return;}
    setup.hidden=true;stage.hidden=false;next();};
  function next(){cur=queue.shift();flipped=false;drawCard();}
  function drawCard(){stage.innerHTML='';
    if(!cur){stage.append(el('div',{class:'empty-note'},el('b',{text:`Session done: ${done} card${done===1?'':'s'} reviewed.`}),el('p',{text:'Cards you knew will come back after a longer gap. Cards you missed will come back tomorrow.'}),el('button',{class:'btn',type:'button',text:'Back to the deck',onclick:()=>{stage.hidden=true;setup.hidden=false;drawStats();}})));drawStats();return;}
    const c=cur;const s=st[c.t];
    const front=el('div',{class:'fc-face fc-front'},el('small',{text:s?'Box '+s.b:'New card'}),el('b',{html:c.t}),el('span',{class:'hint',text:'Say what it means, then flip.'}));
    const backF=el('div',{class:'fc-face fc-back'},el('b',{html:c.t}),el('p',{html:c.m}),c.e?el('p',{class:'fc-eg',html:'<b>Example:</b> '+c.e}):null,c.f?el('a',{href:c.f,text:'Read more: '+c.n.replace(/<[^>]+>/g,'')}):null);
    const cardEl=el('div',{class:'fc-card',tabindex:'0',role:'button','aria-label':'Flip card'},el('div',{class:'fc-inner'},front,backF));
    const flip=()=>{flipped=!flipped;cardEl.classList.toggle('flip',flipped);btns.hidden=!flipped;};
    cardEl.onclick=e=>{if(e.target.closest('a'))return;flip();};
    const no=el('button',{class:'ghost',type:'button',html:'Still learning <kbd>1</kbd>',onclick:()=>answer(false)});
    const yes=el('button',{class:'btn',type:'button',html:'Got it <kbd>2</kbd>',onclick:()=>answer(true)});
    const btns=el('div',{class:'fc-ans',hidden:true},no,yes);
    const rd=window.GSTTS?el('button',{class:'ghost fc-say',type:'button',html:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg> Read aloud',onclick:e=>{e.stopPropagation();GSTTS.read(flipped?[...backF.querySelectorAll(':scope > b, :scope > p')]:[front.querySelector('b')],'Flashcard');}}):null;
    stage.append(el('div',{class:'fc-prog'},el('span',{text:`${queue.length+1} left in this session`}),rd,el('button',{class:'ghost',type:'button',text:'End session',onclick:()=>{queue=[];cur=null;drawCard();}})),cardEl,el('p',{class:'hint fc-keys',html:'Click the card or press <kbd>Space</kbd> to flip.'}),btns);
    stage._flip=flip;stage._btns=btns;
  }
  function answer(ok){const s=st[cur.t]||{b:0};
    if(ok){s.b=Math.min(5,(s.b||0)+1);s.d=now()+GAP[s.b-1]*DAY;}else{s.b=1;s.d=now()+DAY;queue.push(cur);}
    st[cur.t]=s;LS.set(KEY,st);if(ok)done++;next();}
  document.addEventListener('keydown',e=>{if(stage.hidden||!cur||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;
    if(e.key===' '){e.preventDefault();stage._flip&&stage._flip();}
    else if(flipped&&e.key==='1')answer(false);else if(flipped&&e.key==='2')answer(true);});
  drawStats();
}

/* =====================================================================
   4. WRITTEN-ANSWER PRACTICE
   ===================================================================== */
const NEW_WRITTEN=[
 {s:'y3',q:'Explain how IAS 8 treats a change in accounting policy, a change in accounting estimate and a prior period error.',model:'IAS 8 treats the three differently. A change in accounting policy, such as moving from FIFO to weighted average, is applied retrospectively: the comparative figures and opening retained earnings are restated as if the new policy had always applied. A voluntary change is allowed only if it gives more reliable and relevant information. A prior period error is also corrected retrospectively, restating the earlier figures and disclosing the correction. A change in estimate, such as a revised useful life, is applied prospectively, affecting only the current and future periods. If it is unclear which it is, it is treated as a change in estimate.',points:['Policy change: retrospective, restate comparatives','Voluntary change only if more reliable and relevant','Error: retrospective correction with disclosure','Estimate change: prospective, current and future periods','When unclear, treat as a change in estimate']},
 {s:'y3',q:'Distinguish between adjusting and non-adjusting events after the reporting period, with an example of each.',model:'IAS 10 covers events between the year end and the date the accounts are authorised for issue. Adjusting events give evidence of conditions that existed at the year end, so the figures are changed; for example, a customer who owed money at the year end goes into liquidation in January. Non-adjusting events relate to conditions that arose after the year end, so the figures are not changed, but material events are disclosed with their financial effect; for example, a fire in February. Dividends declared after the year end are not a liability. If management decides after the year end to liquidate the company, the going concern basis cannot be used.',points:['Period covered: year end to date of authorisation','Adjusting: evidence of conditions at the year end, with example','Non-adjusting: conditions arising after, disclosed if material, with example','Dividends declared after the year end are not a liability','Going concern exception']},
 {s:'y3',q:'Explain how a grant towards the cost of a new machine is accounted for under IAS 20.',model:'IAS 20 requires a grant to be recognised only when there is reasonable assurance that the company will meet its conditions and receive it. A grant related to an asset is matched with the cost of that asset over its useful life. The company can either show the grant as deferred income, releasing it to profit or loss over the asset’s life, or deduct it from the asset’s cost, which reduces the depreciation charge. Both give the same profit. If the grant later has to be repaid, it is set first against any unreleased deferred income, and the rest is expensed immediately.',points:['Recognise when there is reasonable assurance on conditions and receipt','Matched to the asset’s useful life','Deferred income method explained','Deduct-from-cost method explained','Repayment: against deferred income first, excess expensed']},
 {s:'y3',q:'When must borrowing costs be capitalised under IAS 23, and when does capitalisation start and stop?',model:'IAS 23 requires borrowing costs that are directly attributable to the acquisition, construction or production of a qualifying asset to be capitalised as part of its cost. A qualifying asset is one that takes a substantial period of time to get ready for use or sale, such as a factory. For a specific loan, the actual interest is capitalised, less any income from temporarily investing the funds. For general borrowings, a weighted average capitalisation rate is applied to the spending. Capitalisation starts when spending and borrowing costs are being incurred and work has begun, is suspended during long pauses in active work, and stops when the asset is substantially ready for use.',points:['Directly attributable costs on a qualifying asset must be capitalised','Definition of a qualifying asset','Specific loan less investment income; general borrowings at weighted rate','Start: spending, borrowing costs and work all under way','Suspend during long pauses; stop when substantially complete']},
 {s:'y3',q:'Explain how basic EPS is calculated and why investors use it.',model:'Basic earnings per share is profit after tax attributable to ordinary shareholders, which means after deducting preference dividends, divided by the weighted average number of ordinary shares in issue in the year. Shares issued at full price are weighted for the time they were in issue. A bonus issue brings in no new resources, so it is treated as if it happened at the start of the year and the previous year’s EPS is restated. Investors use EPS to compare performance over time and between companies of different sizes, and it forms part of the P/E ratio. Diluted EPS shows the effect of potential shares such as options.',points:['Earnings after preference dividends','Weighted average number of shares','Bonus issue treated as from the start, comparative restated','Use: compare over time and between companies; P/E ratio','Mentions diluted EPS']},
 {s:'y3',q:'What is investment property, and how does the fair value model differ from IAS 16 revaluation?',model:'Investment property is land or buildings held to earn rent, for capital appreciation, or both, rather than used by the company or held for sale in the ordinary course of business. It is first measured at cost. The company then chooses the cost model or the fair value model for all its investment property. Under the fair value model, the property is remeasured at each year end, gains and losses go to profit or loss, and no depreciation is charged. This differs from an IAS 16 revaluation, where gains go to other comprehensive income and the asset continues to be depreciated.',points:['Definition: held for rent or capital appreciation','Excludes owner-occupied property and inventory','Choice of model applied to all investment property','Fair value model: gains and losses to profit or loss, no depreciation','Contrast with IAS 16: gains to OCI and depreciation continues']},
 {s:'y3',q:'Explain how a UK company accounts for a purchase invoiced in US dollars that is unpaid at the year end.',model:'Under IAS 21, the purchase and the payable are first recorded in pounds at the spot exchange rate on the transaction date. At the year end the payable is a monetary item, so it is retranslated at the closing rate, and the difference is an exchange gain or loss in profit or loss. The inventory bought is a non-monetary item held at cost, so it stays at the historical rate. When the invoice is paid, any further difference between the amount paid and the carrying amount is also an exchange gain or loss in profit or loss.',points:['Record at the spot rate on the transaction date','Payable is monetary: retranslate at the closing rate','Exchange difference to profit or loss','Inventory is non-monetary: stays at the historical rate','Settlement difference also to profit or loss']},
 {s:'y3',q:'Explain the IFRS 13 definition of fair value and the fair value hierarchy.',model:'IFRS 13 defines fair value as the price that would be received to sell an asset, or paid to transfer a liability, in an orderly transaction between market participants at the measurement date. It is an exit price and a market-based measure, not specific to the company. The price comes from the principal market, or if there isn’t one, the most advantageous market, after transport costs but not transaction costs. The hierarchy ranks inputs: Level 1 is quoted prices for identical assets in active markets; Level 2 is other observable inputs; Level 3 is unobservable inputs such as the company’s own forecasts. More disclosure is needed for Level 3 measurements.',points:['Exit price between market participants at the measurement date','Principal or most advantageous market','Transport costs deducted, transaction costs not','Level 1, 2 and 3 described correctly','Level 3 needs more disclosure']}
];
function writtenPage(){
  const root=document.getElementById('written-root');if(!root)return;
  const Y3=(typeof WRITTEN!=='undefined'?WRITTEN:[]).map(w=>Object.assign({s:'y3'},w)).concat(NEW_WRITTEN);
  const INT=(typeof INT_WRITTEN!=='undefined'?INT_WRITTEN:[]).map(w=>Object.assign({s:'int'},w));
  const SETS=[['y3','Year 3 standards','Aim for 5–8 sentences: name the standard, state the rule, apply it, and explain why.',Y3],['int','Interview answers','Write it as you would say it, in about a minute’s worth of speech.',INT]];
  const chips=el('div',{class:'wr-chips'});let cur='all';
  const list=el('div',{});
  [['all','All'],['y3','Year 3 standards'],['int','Interview answers']].forEach(([k,t])=>chips.append(el('button',{class:'chip'+(k===cur?' on':''),type:'button',text:t,onclick:e=>{cur=k;[...chips.children].forEach(c=>c.classList.toggle('on',c===e.currentTarget));draw();}})));
  const rnd=el('button',{class:'ghost',type:'button',text:'Random question',onclick:()=>{const cs=[...list.querySelectorAll('.q')];if(!cs.length)return;const c=cs[Math.floor(Math.random()*cs.length)];c.scrollIntoView({behavior:'smooth',block:'start'});c.classList.add('wr-flash');setTimeout(()=>c.classList.remove('wr-flash'),1600);}});
  root.append(el('div',{class:'wr-tip'},el('b',{text:'How to answer'}),el('ol',{},el('li',{html:'<b>Name</b> the standard or idea.'}),el('li',{html:'<b>State</b> the rule in plain words.'}),el('li',{html:'<b>Apply</b> it with a short example or figures.'}),el('li',{html:'<b>Conclude</b>: why it matters, or what the effect is.'}))),el('div',{class:'wr-bar'},chips,rnd),list);
  function draw(){list.innerHTML='';SETS.forEach(([k,t,hint,arr])=>{if(cur!=='all'&&cur!==k)return;
    list.append(el('h2',{class:'rv-h'},el('span',{text:t}),el('small',{text:arr.length+' questions'})));
    arr.forEach((w,i)=>list.append(card('written',fixed({type:'written',prompt:`<p><b>${w.q}</b></p><p class="hint">${hint}</p>`,model:w.model,points:w.points}),(k==='int'?'Interview ':'Question ')+(i+1))));});}
  draw();
}

if(PID==='exam')examPage();
if(PID==='review')reviewPage();
if(PID==='flashcards')flashPage();
if(PID==='written')writtenPage();
})();
