import { Agent, AgentMessage } from './types';

interface SkillGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  course: string;
  courseUrl: string;
  aiRisk: 'high' | 'medium' | 'low';
}

const UPSKILL_MAP: Record<string, SkillGap> = {
  python:            { skill: 'Python',          priority: 'high',   course: 'Python for Everybody',         courseUrl: 'https://www.coursera.org/specializations/python',                              aiRisk: 'low' },
  typescript:        { skill: 'TypeScript',      priority: 'high',   course: 'TypeScript for JS Devs',       courseUrl: 'https://www.linkedin.com/learning/typescript-for-javascript-developers',      aiRisk: 'low' },
  aws:               { skill: 'AWS',             priority: 'high',   course: 'AWS Cloud Practitioner',       courseUrl: 'https://aws.amazon.com/training/learn-about/cloud-practitioner',              aiRisk: 'low' },
  'machine learning':{ skill: 'Machine Learning',priority: 'high',   course: 'ML Specialization',            courseUrl: 'https://www.coursera.org/specializations/machine-learning-introduction',      aiRisk: 'low' },
  llm:               { skill: 'LLM Engineering', priority: 'high',   course: 'Generative AI Engineering',    courseUrl: 'https://www.coursera.org/learn/generative-ai-engineering',                     aiRisk: 'low' },
  react:             { skill: 'React',           priority: 'medium', course: 'React — The Complete Guide',   courseUrl: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',            aiRisk: 'medium' },
  kubernetes:        { skill: 'Kubernetes',      priority: 'medium', course: 'Kubernetes for Developers',    courseUrl: 'https://www.linkedin.com/learning/kubernetes-for-developers',                  aiRisk: 'low' },
};

export class CareerPlannerAgent implements Agent {
  name = 'careerPlanner';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const jobs: any[]           = message.data?.jobs ?? [];
    const profileSkills: string[] = message.data?.profileSkills ?? [];

    const required = new Set<string>();
    for (const job of jobs) {
      for (const kw of (job.analysis?.keywords ?? []) as string[]) {
        required.add(kw.toLowerCase());
      }
    }

    const gaps: SkillGap[] = [];
    for (const skill of required) {
      const hasIt = profileSkills.some((s) => s.toLowerCase().includes(skill));
      if (!hasIt && UPSKILL_MAP[skill]) gaps.push(UPSKILL_MAP[skill]);
    }

    const highRisk = profileSkills.filter((s) => UPSKILL_MAP[s.toLowerCase()]?.aiRisk === 'high');

    return {
      content: 'career plan generated',
      data: {
        ...message.data,
        careerPlan: {
          gaps: gaps.sort((a) => (a.priority === 'high' ? -1 : 1)),
          highRiskSkills: highRisk,
          recommendation: gaps.length
            ? `Focus on: ${gaps.slice(0, 3).map((g) => g.skill).join(', ')}`
            : 'Profile well-matched to current job market.',
        },
      },
    };
  }
}
