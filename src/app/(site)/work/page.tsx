import type { Metadata } from "next";

import { PageHeader, Section } from "@/components/content/page-header";
import { Timeline } from "@/components/content/timeline";
import { formatPeriod } from "@/components/content/timeline";
import { PrintButton } from "@/components/content/print-button";
import { getEducation, getExperience, getTalks } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

const TITLE = "Work";
const DESCRIPTION = "Roles, education and talks. This page prints as a one-page resume.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/work",
});

/** Work history, education and talks from `content/data`. */
export default function WorkPage() {
  const experience = getExperience();
  const education = getEducation();
  const talks = getTalks();

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION}>
        <div className="no-print mt-4">
          <PrintButton />
        </div>
      </PageHeader>

      <Section title="Experience">
        <Timeline
          entries={experience.map((role) => ({
            key: `${role.company}-${role.start}`,
            title: role.role,
            subtitle: role.company,
            period: formatPeriod(role.start, role.end),
            location: role.location,
            body: (
              <>
                {role.summary ? <p>{role.summary}</p> : null}
                {role.highlights.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {role.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
                {role.links.length > 0 ? (
                  <p className="no-print flex flex-wrap gap-4">
                    {role.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        rel="noopener"
                        className="text-accent hover:underline"
                      >
                        {link.label}
                      </a>
                    ))}
                  </p>
                ) : null}
              </>
            ),
          }))}
        />
      </Section>

      {education.length > 0 ? (
        <Section title="Education">
          <Timeline
            entries={education.map((entry) => ({
              key: `${entry.school}-${entry.start}`,
              title: entry.degree,
              subtitle: entry.school,
              period: formatPeriod(entry.start, entry.end),
              location: entry.location,
              body: entry.summary ? <p>{entry.summary}</p> : undefined,
            }))}
          />
        </Section>
      ) : null}

      {talks.length > 0 ? (
        <Section title="Talks">
          <ul className="list-none divide-y p-0">
            {talks.map((talk) => (
              <li key={`${talk.title}-${talk.date}`} className="py-4">
                <h3 className="font-semibold">{talk.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {talk.event} · <time dateTime={talk.date}>{formatDate(talk.date)}</time>
                  {talk.location ? ` · ${talk.location}` : ""}
                </p>
                {talk.links.length > 0 ? (
                  <p className="no-print mt-1 flex flex-wrap gap-4 text-sm">
                    {talk.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        rel="noopener"
                        className="text-accent hover:underline"
                      >
                        {link.label}
                        <span className="sr-only">: {talk.title}</span>
                      </a>
                    ))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
