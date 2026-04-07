# SimuLab এ Automatic Lab Report Generation: বিস্তারিত বাংলা টিউটোরিয়াল

এই ডকুমেন্টে SimuLab প্রজেক্টে নতুন যোগ করা **automatic lab report generation workflow** কীভাবে কাজ করে, সেটা ধাপে ধাপে বাংলায় ব্যাখ্যা করা হয়েছে। এখানে শুধু “কি হচ্ছে” না, বরং “কেন হচ্ছে”, “কোডে কোথায় হচ্ছে”, এবং “একটা button click থেকে database save পর্যন্ত flow” সব দেখানো হয়েছে।

---

## 1. এই ফিচারের মূল উদ্দেশ্য কী?

আগে report button চাপলে browser-এ একটা সাধারণ text file download হতো। কিন্তু সেটা database-এর সাথে linked ছিল না। এখন report system-এর কাজ হচ্ছে:

1. experiment-এর current data এবং setup থেকে report auto-generate করা
2. report-টা student চাইলে edit করতে পারা
3. edited report database-এ `labReport` field-এ save করা
4. report ছাড়া experiment submit করতে না দেওয়া
5. dashboard-এ report আছে কি না সেটা দেখানো

অর্থাৎ এখন report system শুধু export feature না, বরং **experiment lifecycle-এর অংশ**।

---

## 2. পুরো flow এক লাইনে

flowটা মোটামুটি এমন:

1. user lab page-এ যায়
2. experiment data collect হয়
3. `Generate Report` click করলে data + template info দিয়ে markdown report তৈরি হয়
4. report textarea-তে load হয়
5. user চাইলে report edit করে
6. `Save Report` চাপলে report experiment record-এর সাথে database-এ save হয়
7. `Submit` চাপলে backend check করে report আছে কি না
8. report থাকলে submission allow হয়, না থাকলে block হয়

---

## 3. কোন কোন ফাইল এই feature চালায়?

এই feature-এর মূল ফাইলগুলো:

- `src/lib/reportGenerator.ts`
- `src/components/analysis/LabReportPanel.tsx`
- `src/app/lab/[experimentId]/page.tsx`
- `src/app/api/experiments/route.ts`
- `src/app/api/experiments/[id]/route.ts`
- `src/app/dashboard/page.tsx`

প্রতিটি ফাইলের দায়িত্ব আলাদা:

- `reportGenerator.ts`: report-এর content বানায়
- `LabReportPanel.tsx`: report দেখায়, edit করায়, save/download buttons দেয়
- `lab/[experimentId]/page.tsx`: পুরো report workflow orchestrate করে
- `api/experiments/*.ts`: report database-এ save/update/validate করে
- `dashboard/page.tsx`: report status UI-তে দেখায়

---

## 4. Report generate করার engine: `reportGenerator.ts`

ফাইল: `src/lib/reportGenerator.ts`

এই ফাইলের কাজ হচ্ছে raw experiment data থেকে একটা structured markdown report বানানো।

### 4.1 Input structure

`GenerateReportInput` interface report generator-কে বলে দেয় কী কী তথ্য report বানাতে লাগবে:

```ts
interface GenerateReportInput {
  title: string;
  description?: string;
  experimentType: string;
  category?: string;
  status?: string;
  theory?: string;
  objectives?: string[];
  results?: Record<string, any>[];
  snapshot?: Record<string, any> | null;
  generatedAt?: string;
}
```

মানে report generate করার সময় system নিচের জিনিসগুলো পাঠায়:

- experiment title
- description
- experiment type
- category
- current status
- theory
- objectives
- measured data rows
- setup snapshot
- generation time

### 4.2 `formatValue()` কী করে?

এই helper function report-এর মধ্যে data readable format-এ দেখানোর জন্য ব্যবহার হয়।

এর কাজ:

- number হলে nicely format করে
- boolean হলে `Yes` / `No` বানায়
- array হলে item count দেখায়
- object হলে JSON string বানায়
- null বা undefined হলে safe string দেয়

এতে report-এর setup summary section messy হয় না।

### 4.3 `computeStatistics()` কী করে?

এই function measurement data থেকে numeric fields বের করে basic statistics হিসাব করে।

যেমন:

- `count`
- `min`
- `max`
- `mean`
- `last`

এখানে গুরুত্বপূর্ণ logic:

1. প্রথম row থেকে keys নেয়
2. যেসব key অন্তত কিছু row-তে numeric, সেগুলো filter করে
3. প্রতিটি numeric key-এর জন্য summary metric বানায়

এভাবে যদি data rows-এর মধ্যে `time`, `velocity`, `position`, `ph`, `temperature` ইত্যাদি থাকে, report সেগুলোর metric section auto-fill করে।

### 4.4 `summarizeSnapshot()` কী করে?

experiment-এর saved state-এর মধ্যে অনেক কিছু থাকতে পারে। কিন্তু পুরো raw object report-এ ঢুকালে report huge হয়ে যাবে। তাই:

- `dataPoints` বাদ দেয়
- `savedAt` বাদ দেয়
- null/undefined বাদ দেয়
- প্রথম ১০টা meaningful key নেয়

এর ফলে setup section compact থাকে।

### 4.5 `generateReport()` আসলে কী বানায়?

এই function শেষ পর্যন্ত markdown report string return করে।

report-এর sectionগুলো:

- Title
- Generated time
- Experiment type
- Category
- Status
- Overview
- Theory Summary
- Objectives
- Data Summary
- Setup Snapshot
- Key Metrics
- Sample Measurements
- Observations
- Conclusion
- Next Steps

এর মধ্যে কিছু অংশ auto-filled:

- overview
- theory
- objectives
- sample data
- numeric metrics
- setup summary

আর কিছু অংশ intentionally editable placeholder:

- observations
- conclusion
- next steps

এটা খুব smart design, কারণ এতে report auto-generate হয়, কিন্তু student-এর নিজের analysis দেওয়ার জায়গাও থাকে।

---

## 5. Report editor UI: `LabReportPanel.tsx`

ফাইল: `src/components/analysis/LabReportPanel.tsx`

এটা report-এর UI component। এই component-এর কাজ data generate করা না, বরং generated report user-এর সামনে present করা।

### 5.1 Props

এই component নিচের props নেয়:

- `report`
- `onChange`
- `onGenerate`
- `onSave`
- `onDownload`
- `isGenerating`
- `isSaving`
- `hasSavedExperiment`
- `isDirty`
- `experimentStatus`

এগুলো থেকে বোঝা যায় component নিজে stateful backend logic চালায় না; parent page তাকে data আর callbacks দেয়।

### 5.2 UI structure

panel-এর মধ্যে আছে:

- header
- report status badge
- `Generate Report` button
- `Save Report` button
- `Download Report` button
- dirty/synced status message
- textarea editor

### 5.3 `hasReport`

এই line:

```ts
const hasReport = report.trim().length > 0;
```

খুব গুরুত্বপূর্ণ। কারণ এই check দিয়ে:

- empty report save করা বন্ধ হয়
- download disable করা হয়
- badge text বদলায়
- user feedback message বদলায়

### 5.4 `isDirty`

`isDirty` মানে current textarea content আর database-এ saved version একই কি না।

যদি user report generate করে edit করে কিন্তু save না করে, panel তাকে বলে:

`You have unsaved report changes.`

এটা UX-এর জন্য খুব useful।

---

## 6. মূল orchestration: `lab/[experimentId]/page.tsx`

ফাইল: `src/app/lab/[experimentId]/page.tsx`

এই ফাইল হচ্ছে পুরো report flow-এর controller।

### 6.1 নতুন state

এই page-এ report workflow-এর জন্য কয়েকটা নতুন state যোগ করা হয়েছে:

- `labReport`
- `savedLabReport`
- `isGeneratingReport`
- `isSavingReport`

এগুলোর কাজ:

- `labReport`: textarea-তে এখন যা আছে
- `savedLabReport`: backend-এ last saved version
- `isGeneratingReport`: generation spinner দেখাতে
- `isSavingReport`: save spinner দেখাতে

আরেকটা derived state:

```ts
const isReportDirty = labReport !== savedLabReport;
```

মানে editor-এর content save হয়েছে কি না সেটা compare দিয়ে বের করা হচ্ছে।

### 6.2 saved experiment load হলে report-ও load হয়

যখন saved experiment fetch হয়, তখন শুধু state/dataPoints না, backend-এর `labReport`-ও load হয়।

মানে continue করলে:

- simulation snapshot reload হয়
- report content-ও reload হয়

এটা খুব important, কারণ report workflow experiment lifecycle-এর অংশ।

### 6.3 `persistExperiment()` এখন report-ও save করে

আগে experiment save করার সময় payload-এ mainly `state` যেত। এখন payload-এর সাথে এটা যায়:

```ts
labReport: labReport.trim()
```

এর মানে:

- draft save করলে report save হয়
- completed save করলে report save হয়
- submitted save করলে report save হয়

অর্থাৎ report আর আলাদা detached entity না; experiment record-এর ভেতরেই থাকে।

### 6.4 `handleGenerateReport()`

এই function-ই auto-generation চালায়।

এটা `generateReport()`-এ নিচের data পাঠায়:

- template name
- description
- category
- theory
- objectives
- active data points
- current snapshot
- current experiment status

অর্থাৎ generated report raw data dump না; experiment template-এর academic context-ও report-এর মধ্যে ঢুকে যায়।

এখানে line-level idea:

```ts
const report = generateReport({
  title: ...,
  description: template.description,
  experimentType,
  category: template.category,
  status: experimentStatus,
  theory: template.theory,
  objectives: template.objectives,
  results: activeDataPoints,
  snapshot: workbenchSnapshot || { ... },
});
```

এটাই automatic report generation-এর core call।

### 6.5 `activeDataPoints` কেন দরকার?

এই page-এ generic physics experiments আর dedicated workbench experiments দুটোই আছে।

তাই report-এর জন্য data source দুই রকম হতে পারে:

- generic experiments: parent page-এর `dataPoints`
- dedicated workbench: `workbenchSnapshot.dataPoints`

এই সমস্যা solve করতে derived variable ব্যবহার করা হয়েছে:

- যদি `workbenchSnapshot.dataPoints` থাকে, সেটা use করা
- না থাকলে normal `dataPoints` use করা

এতে সব experiment type-এর জন্য same report flow কাজ করে।

### 6.6 `handleSaveReport()`

এই function report empty কি না check করে।

empty হলে save block করে:

```ts
if (!trimmedReport) {
  alert('Generate or write a report before saving.');
  return;
}
```

তারপর `persistExperiment('draft')` call করে।

এখানে একটা design advantage আছে:

- report save করতে আলাদা নতুন API লাগে না
- same experiment persistence flow reuse হয়
- new experiment হলেও draft তৈরি হয়ে report save হয়

### 6.7 `handleDownloadReport()`

এই function database save ছাড়াও user-কে local `.md` download করতে দেয়।

steps:

1. report empty কি না check
2. `Blob` বানায়
3. object URL বানায়
4. `<a>` element দিয়ে download trigger করে

download file name হয়:

`<experimentType>_lab_report_<timestamp>.md`

### 6.8 Submit guard

সবচেয়ে important business rule:

```ts
if (nextStatus === 'submitted' && !labReport.trim()) {
  alert('Generate and review your lab report before submitting this experiment.');
  return;
}
```

মানে frontend থেকেই submission block করা হচ্ছে যদি report না থাকে।

আর UI level-এ Submit button-ও disable:

```ts
disabled={isPersisting || experimentStatus === 'submitted' || !labReport.trim()}
```

অর্থাৎ:

- report না থাকলে click-ও করা যাবে না
- somehow click হলেও guard আবার block করবে

একে বলে **defense in depth**।

### 6.9 `renderReportPanel()`

এই helper function `LabReportPanel` render করে এবং সব props inject করে।

এর মাধ্যমে report panel generic physics lab-এর sidebar-এও reuse হয়, dedicated experiment pages-এর নিচেও reuse হয়।

এটা maintainability-এর জন্য ভালো:

- same UI
- same callbacks
- same behavior
- less duplication

---

## 7. Backend create API: `api/experiments/route.ts`

ফাইল: `src/app/api/experiments/route.ts`

এখানে POST API নতুন experiment create করে।

এখন body থেকে এই field-ও নেওয়া হচ্ছে:

```ts
const { title, description, category, experimentType, state, status, labReport } = body;
```

### 7.1 কেন এটা দরকার?

কারণ user যদি আগে report generate করে, তারপর প্রথমবার save/submit করে, তখন record create হওয়ার সময়ই report save হতে হবে।

### 7.2 normalization

backend দুইটা জিনিস normalize করে:

- `status`
- `labReport`

```ts
const normalizedStatus = ['draft', 'completed', 'submitted'].includes(status) ? status : 'draft';
const normalizedReport = typeof labReport === 'string' ? labReport.trim() : '';
```

### 7.3 server-side validation

যদি new experiment `submitted` status-এ create করতে চাওয়া হয় কিন্তু report empty হয়, backend reject করে:

```ts
if (normalizedStatus === 'submitted' && !normalizedReport) {
  ...
}
```

এটা দরকার, কারণ frontend bypass করলেও backend business rule enforce করবে।

---

## 8. Backend update API: `api/experiments/[id]/route.ts`

ফাইল: `src/app/api/experiments/[id]/route.ts`

এই API saved experiment update করে।

### 8.1 update flow

এখানে আগে `findOneAndUpdate` ছিল, এখন flow হচ্ছে:

1. experiment load করো
2. field-by-field update করো
3. validation চালাও
4. save করো

এই approach-এর সুবিধা:

- existing data context পায়
- status + labReport cross-validation সহজ হয়

### 8.2 গুরুত্বপূর্ণ validation

এই line খুব গুরুত্বপূর্ণ:

```ts
if (experiment.status === 'submitted' && !experiment.labReport?.trim()) {
```

মানে:

- status যদি `submitted`
- কিন্তু `labReport` empty
- তাহলে backend reject করবে

এটা frontend-এর submit guard-এর backend version।

অর্থাৎ submission rule দুই জায়গায় enforced:

- UI
- API

---

## 9. Dashboard integration: `dashboard/page.tsx`

ফাইল: `src/app/dashboard/page.tsx`

dashboard-এ report system এখন visible।

### 9.1 Experiment interface-এ `labReport`

dashboard এখন experiment record থেকে `labReport`-ও নেয়:

```ts
labReport?: string;
```

### 9.2 `hasReport`

প্রতিটি card-এ check হয় report আছে কি না:

- report থাকলে green icon/message
- না থাকলে amber warning

UI message:

- `Lab report saved`
- `Lab report not started`

### 9.3 submit button guard

dashboard থেকেও direct submit এখন report ছাড়া করা যায় না।

logic:

- যদি report থাকে, `Submit` button দেখায়
- না থাকলে `Report Required` badge দেখায়
- সাথে `Add Report` shortcut link দেয়

এতে dashboard থেকেই user বুঝতে পারে:

- কোন experiment submit-ready
- কোনটার report missing

---

## 10. Automatic report generation ঠিক কী data ব্যবহার করছে?

auto report generate হওয়ার সময় system মূলত ৩ ধরনের data use করছে:

### 10.1 Template data

`EXPERIMENT_TEMPLATES` থেকে:

- experiment name
- description
- theory
- objectives
- category

এতে report academic structure পায়।

### 10.2 Captured measurement data

`activeDataPoints` থেকে:

- total rows
- variable names
- numeric metrics
- sample measurement table

এতে report evidence-based হয়।

### 10.3 Setup snapshot

`workbenchSnapshot` বা fallback setup state থেকে:

- height
- selected controls
- experiment settings
- current scene/setup summary

এতে report-এ “কোন condition-এ experiment চালানো হয়েছিল” সেটা আসে।

---

## 11. কেন এটাকে “automatic” বলা যায়?

কারণ user manually শুরু থেকে report লেখে না। system already:

- title বানায়
- overview section দেয়
- theory section দেয়
- objectives section দেয়
- data summary দেয়
- metrics calculate করে
- sample measurement table দেয়
- setup summary দেয়
- editable analysis placeholders দেয়

অর্থাৎ ৭০-৮০% structure system তৈরি করে দেয়, user শুধু final observation/conclusion improve করতে পারে।

---

## 12. পুরো button click flow: practical walkthrough

ধরি user `Projectile Motion` experiment-এ আছে।

### Step 1

user কিছু data collect করল।

### Step 2

`Generate Report` চাপল।

তখন:

1. `handleGenerateReport()` call হয়
2. `generateReport()`-এ experiment data পাঠানো হয়
3. markdown string তৈরি হয়
4. `setLabReport(report)` textarea fill করে

### Step 3

user report edit করল।

তখন:

1. textarea `onChange`
2. `setLabReport(newText)`
3. `labReport !== savedLabReport`
4. UI বলে report unsaved

### Step 4

user `Save Report` চাপল।

তখন:

1. `handleSaveReport()` run হয়
2. empty report check হয়
3. `persistExperiment('draft')` call হয়
4. API-তে `labReport` payload যায়
5. database-এ `Experiment.labReport` update হয়

### Step 5

user `Submit` চাপল।

তখন:

1. frontend check করে report আছে কি না
2. না থাকলে block
3. থাকলে API call
4. backend আবার check করে report আছে কি না
5. pass হলে status `submitted`

---

## 13. এই design-এর শক্তি

এই implementation-এর ভালো দিকগুলো:

### 13.1 report experiment-এর সাথে tightly coupled

report আলাদা table না; experiment record-এর অংশ। তাই sync problem কম।

### 13.2 draft-first approach

user চাইলে report save করার সময় experiment draft হিসেবেও save হয়। এতে unsaved work হারায় না।

### 13.3 frontend + backend দুদিকেই validation

শুধু button disable না, backend-ও enforce করে।

### 13.4 reusable UI

`LabReportPanel` আলাদা component হওয়ায় future-এ instructor review বা admin feedback add করা সহজ।

### 13.5 markdown-based report

markdown text হলে:

- editable
- downloadable
- readable
- future-এ PDF conversion easy

---

## 14. বর্তমান limitation

এই implementation ভালোভাবে কাজ করলেও কিছু limitation আছে:

### 14.1 AI summary না

এটা true AI-generated semantic summary না; template + data + statistics based structured generation।

### 14.2 placeholder sections manual

observations, conclusion, next steps user-কে improve করতে হবে।

### 14.3 template-specific deep interpretation নেই

যেমন projectile motion-এর জন্য angle বনাম range-এর scientific explanation আলাদা rule দিয়ে লেখা হচ্ছে না।

### 14.4 rich formatting নেই

markdown string আছে, কিন্তু PDF export / styled document rendering এখনো নেই।

---

## 15. আপনি future-এ কী improve করতে পারেন?

পরের ধাপে এই feature আরও শক্তিশালী করতে চাইলে:

1. report sections কে JSON schema আকারে store করা
2. instructor feedback যোগ করা
3. report approval status যোগ করা
4. markdown থেকে PDF export করা
5. experiment-specific intelligent conclusions generate করা
6. charts embedded snapshot আকারে report-এ add করা

---

## 16. ছোট summary

এই automatic report system-এর heart হচ্ছে:

- `generateReport()` report content তৈরি করে
- `LabReportPanel` user-কে report edit/save/download করতে দেয়
- `persistExperiment()` report-কে experiment-এর সাথে save করে
- backend submission-এর আগে report validate করে
- dashboard user-কে report status দেখায়

অর্থাৎ এখন report system শুধু download utility না, বরং **save -> review -> submit** workflow-এর official অংশ।

---

## 17. Code reading order recommendation

যদি আপনি code বুঝতে বসেন, এই order follow করুন:

1. `src/lib/reportGenerator.ts`
2. `src/components/analysis/LabReportPanel.tsx`
3. `src/app/lab/[experimentId]/page.tsx`
4. `src/app/api/experiments/route.ts`
5. `src/app/api/experiments/[id]/route.ts`
6. `src/app/dashboard/page.tsx`

এই order-এ পড়লে flowটা সবচেয়ে সহজে মাথায় বসবে।

---

## 18. Final takeaway

এক লাইনে বললে:

**SimuLab এখন experiment data থেকে auto-structured markdown report বানায়, user সেটা edit করতে পারে, database-এ save করতে পারে, আর report ছাড়া experiment submit করা যায় না।**

