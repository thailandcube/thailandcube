'use client';

import {
  Card,
  Separator,
} from '@heroui/react';
import { FileText } from '@gravity-ui/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const WcaRelatedDocs = [
  {
    link: 'https://documents.worldcubeassociation.org/documents/policies/external/Competition%20Requirements.pdf',
    translationKey: 'wca_comp_req',
  },
  {
    link: 'https://regulations.worldcubeassociation.org/wca-regulations-and-guidelines.pdf',
    translationKey: 'wca_reg_guide',
  },
  {
    link: 'https://documents.worldcubeassociation.org/edudoc/judge-tutorial/judge-tutorial.pdf',
    translationKey: 'judge_tutorial',
  },
  {
    link: 'https://documents.worldcubeassociation.org/edudoc/competitor-tutorial/tutorial.pdf',
    translationKey: 'wca_comp_tutorial',
  },
];

const ThaiTranslatedDocs = [
  {
    link: '/docs/wca-regulations-th.pdf',
    translationKey: 'wca_reg_guide_th',
  },
  {
    link: '/docs/wca-competition_tutorial-th.pdf',
    translationKey: 'wca_comp_tutorial_th',
  },
  {
    link: '/docs/judging-tutorial-th.pdf',
    translationKey: 'judge_tutorial_th',
  },
];

type ResourceDoc = {
  link: string;
  label: string;
};

type ResourceCardProps = {
  title: string;
  icon?: React.ReactNode;
  docs: ResourceDoc[];
  className?: string;
};

function ResourceCard({ title, icon, docs, className }: ResourceCardProps) {
  return (
    <Card className={className}>
      <Card.Header className="px-6 py-5">
        <div className="flex w-full items-center justify-between gap-4">
          <Card.Title className="text-lg font-bold">{title}</Card.Title>
          {icon}
        </div>
      </Card.Header>
      <Separator />
      <Card.Content className="gap-2 px-4 py-4">
        {docs.map((doc, i) => (
          <Link
            key={i}
            href={doc.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-default-100"
          >
            <div className="rounded-lg bg-default-100 p-2 text-default-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-default-50">
              <FileText width={20} height={20} />
            </div>
            <span className="font-medium text-default-700 transition-colors group-hover:text-primary">
              {doc.label}
            </span>
          </Link>
        ))}
      </Card.Content>
    </Card>
  );
}

export default function ResourcesPage() {
  const t = useTranslations('Resources');
  const locale = useLocale();

  const wcaDocs = WcaRelatedDocs.map((doc) => ({
    link: doc.link,
    label: t(doc.translationKey),
  }));

  const thaiDocs = ThaiTranslatedDocs.map((doc) => ({
    link: doc.link,
    label: t(doc.translationKey),
  }));

  const solvingGuideDocs = [
    {
      link: `/assets/docs/how-to-solve-333-${locale}.pdf`,
      label: t('solving_guide'),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-10">
      <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ResourceCard
          className="w-full"
          title={t('wca_related')}
          icon={<Image width={40} height={40} src="/assets/img/wca.svg" alt="WCA Logo" />}
          docs={wcaDocs}
        />

        <ResourceCard
          className="w-full"
          title={t('translated_docs')}
          icon={
            <Image
              width={40}
              height={40}
              src="/assets/img/thailandcube.svg"
              alt="ThailandCube Logo"
            />
          }
          docs={thaiDocs}
        />

        <ResourceCard
          className="w-full md:col-span-2 md:mx-auto md:max-w-md lg:col-span-1 lg:mx-0 lg:max-w-none"
          title={t('solving_guide')}
          docs={solvingGuideDocs}
        />
      </div>
    </div>
  );
}