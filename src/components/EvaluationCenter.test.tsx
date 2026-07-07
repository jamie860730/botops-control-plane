import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvaluationCenter } from './EvaluationCenter';
import { seedData } from '../data/seedData';
import type { EvalRun } from '../types';

const baseProps = {
  evalCases: seedData.evalCases,
  evalResults: seedData.evalResults,
  evalRuns: seedData.evalRuns,
  evalRunnerStatus: 'Idle',
  judgeCalibrations: seedData.judgeCalibrations,
  onExportCsv: () => {},
  onRunEval: () => {},
  savedEvalCaseIds: {}
};

describe('EvaluationCenter judge calibration', () => {
  it('flags below-threshold judge calibrations as pending human review, not a release basis', () => {
    render(<EvaluationCenter {...baseProps} locale="en" />);

    const lowCard = screen.getByTestId('judge-cal-judge_policy_v02');
    expect(lowCard).toHaveClass('below-threshold');
    expect(lowCard).toHaveTextContent('0.79');
    expect(lowCard).toHaveTextContent('Below threshold');
    expect(lowCard).toHaveTextContent('Drift alert');
    expect(screen.getByTestId('judge-review-warning-judge_policy_v02')).toHaveTextContent(
      'Eval results are pending human review and must not be used as a release basis.'
    );

    const healthyCard = screen.getByTestId('judge-cal-judge_policy_v03');
    expect(healthyCard).not.toHaveClass('below-threshold');
    expect(healthyCard).toHaveTextContent('Calibrated');
    expect(screen.queryByTestId('judge-review-warning-judge_policy_v03')).not.toBeInTheDocument();
  });

  it('marks eval run rows whose judge version calibration is below threshold', () => {
    const runWithLowJudge: EvalRun = {
      ...seedData.evalRuns[0],
      id: 'run_low_judge',
      label: 'Legacy judge run',
      versionConfig: { ...seedData.evalRuns[0].versionConfig, judgeVersion: 'judge_policy_v02' }
    };
    render(<EvaluationCenter {...baseProps} evalRuns={[...seedData.evalRuns, runWithLowJudge]} locale="en" />);

    expect(screen.getByTestId('pending-human-review-run_low_judge')).toHaveTextContent('Pending human review');
    expect(screen.queryByTestId('pending-human-review-run_v19_candidate')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pending-human-review-run_v18_baseline')).not.toBeInTheDocument();
  });

  it('renders zh-TW review warning and run marker wording', () => {
    const runWithLowJudge: EvalRun = {
      ...seedData.evalRuns[0],
      id: 'run_low_judge',
      label: 'Legacy judge run',
      versionConfig: { ...seedData.evalRuns[0].versionConfig, judgeVersion: 'judge_policy_v02' }
    };
    render(
      <EvaluationCenter {...baseProps} evalRuns={[...seedData.evalRuns, runWithLowJudge]} locale="zh-TW" />
    );

    expect(screen.getByTestId('judge-review-warning-judge_policy_v02')).toHaveTextContent(
      '評測結果待人工複核，不得作為發布依據。'
    );
    expect(screen.getByTestId('pending-human-review-run_low_judge')).toHaveTextContent('待人工複核');
  });
});
