export const documentTypes = [
  'спецификация требований',
  'тест-план',
  'отчет о тестировании',
  'журнал дефектов',
  'сертификат соответствия',
  'акт проверки',
  'сведения о версии продукта',
] as const;

export type DocumentType = (typeof documentTypes)[number];

export type DocumentSection = {
  id: string;
  title: string;
  content: string;
};

export type CaseDocument = {
  id: string;
  type: DocumentType;
  title: string;
  summary: string;
  sections: DocumentSection[];
};
