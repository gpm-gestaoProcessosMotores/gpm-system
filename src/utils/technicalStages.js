export const stageOrder = ['mecanica', 'usinagem', 'eletrica'];

export const technicalSectorByProfile = {
  Técnico: '',
};

export const stageTemplates = {
  mecanica: {
    sector: 'Mecânica',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: [],
    attachments: [],
  },
  usinagem: {
    sector: 'Usinagem',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: [],
    attachments: [],
  },
  eletrica: {
    sector: 'Elétrica',
    status: 'Pendente',
    technician: '',
    startedAt: '',
    finishedAt: '',
    report: '',
    checklist: [],
    attachments: [],
  },
};

export function getTechnicalSectorByProfile(profile, fallbackSector = '') {
  if (profile === 'Técnico') {
    return '';
  }

  return technicalSectorByProfile[profile] || fallbackSector || '';
}

export function normalizeStageChecklist(_stageKey, checklist = []) {
  const currentItems = Array.isArray(checklist) ? checklist : [];

  return currentItems
    .filter((item) => String(item?.label || '').trim())
    .map((item) => ({
      label: String(item.label).trim(),
      done: Boolean(item.done),
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
