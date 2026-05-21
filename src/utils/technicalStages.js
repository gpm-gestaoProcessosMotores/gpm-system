export const stageOrder = ['mecanica', 'usinagem', 'eletrica'];

export const technicalSectorByProfile = {
  'Técnico Mecânica': 'Mecânica',
  'Técnico Usinagem': 'Usinagem',
  'Técnico Elétrica': 'Elétrica',
};

export const technicalChecklists = {
  mecanica: [
    { label: 'Inspeção mecânica realizada', done: false },
    { label: 'Troca ou ajuste mecânico realizado', done: false },
    { label: 'Teste mecânico concluído', done: false },
  ],
  usinagem: [
    { label: 'Medição dimensional realizada', done: false },
    { label: 'Serviço de torno/fresa realizado', done: false },
    { label: 'Peças recuperadas e conferidas', done: false },
  ],
  eletrica: [
    { label: 'Teste de isolamento realizado', done: false },
    { label: 'Bobinagem e ligações verificadas', done: false },
    { label: 'Teste elétrico final realizado', done: false },
  ],
};

export const stageTemplates = {
  mecanica: {
    sector: 'Mecânica',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: technicalChecklists.mecanica,
    attachments: [],
  },
  usinagem: {
    sector: 'Usinagem',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: technicalChecklists.usinagem,
    attachments: [],
  },
  eletrica: {
    sector: 'Elétrica',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: technicalChecklists.eletrica,
    attachments: [],
  },
};

export function getTechnicalSectorByProfile(profile, fallbackSector = '') {
  return technicalSectorByProfile[profile] || fallbackSector || '';
}

export function normalizeStageChecklist(stageKey, checklist = [], stageStatus = 'Pendente') {
  const currentItems = Array.isArray(checklist) ? checklist : [];
  const checkedLabels = new Set(currentItems.filter((item) => item.done).map((item) => item.label));
  const markFinished = stageStatus === 'Concluída' && currentItems.some((item) => item.done);

  return (technicalChecklists[stageKey] || []).map((item) => ({
    ...item,
    done: checkedLabels.has(item.label) || markFinished,
  }));
}

export function normalizeTechnicalStages(stages = {}) {
  return stageOrder.reduce((nextStages, stageKey) => {
    const currentStage = stages?.[stageKey] || {};
    const template = stageTemplates[stageKey];

    nextStages[stageKey] = {
      ...template,
      ...currentStage,
      checklist: normalizeStageChecklist(stageKey, currentStage.checklist, currentStage.status),
      attachments: Array.isArray(currentStage.attachments) ? currentStage.attachments : [],
      report: currentStage.report || '',
    };

    return nextStages;
  }, {});
}
