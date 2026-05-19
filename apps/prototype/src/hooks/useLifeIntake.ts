import { useEffect, useState } from 'react'
import {
  buildHealthContextGraph,
  seedLifeIntake,
  type HealthContextGraph,
  type LifeIntake,
} from '@vitapilot/core'
import { vitaPilotRepository } from '../lib/repository'

type GraphStatus = 'idle' | 'generating' | 'generated' | 'error'

export function useLifeIntake() {
  const [intake, setIntake] = useState<LifeIntake>(seedLifeIntake)
  const [healthContextGraph, setHealthContextGraph] = useState<HealthContextGraph | null>(null)
  const [graphStatus, setGraphStatus] = useState<GraphStatus>('idle')
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      Promise.all([
        vitaPilotRepository.getLifeIntake(),
        vitaPilotRepository.getHealthContextGraph(),
      ])
        .then(([storedIntake, storedGraph]) => {
          setIntake(storedIntake)
          setHealthContextGraph(storedGraph)
          setGraphStatus(storedGraph ? 'generated' : 'idle')
        })
        .finally(() => setIsLoading(false))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const updateFreeform = (freeform: string) => {
    setGraphStatus('idle')
    setSaveState('idle')
    setIntake((current) => ({ ...current, freeform }))
  }

  const toggleAnswer = (questionId: string, answer: string, allowMultiple: boolean) => {
    setGraphStatus('idle')
    setSaveState('idle')
    setIntake((current) => {
      const existingResponse = current.responses.find((response) => response.questionId === questionId)
      const currentAnswers = existingResponse?.answers ?? []
      const nextAnswers = allowMultiple
        ? currentAnswers.includes(answer)
          ? currentAnswers.filter((item) => item !== answer)
          : [...currentAnswers, answer]
        : [answer]

      return {
        ...current,
        responses: [
          ...current.responses.filter((response) => response.questionId !== questionId),
          { answers: nextAnswers, questionId },
        ],
      }
    })
  }

  const saveIntake = async () => {
    const nextIntake = { ...intake, updatedAt: new Date().toISOString() }
    setSaveState('saving')
    setIntake(await vitaPilotRepository.saveLifeIntake(nextIntake))

    try {
      setGraphStatus('generating')
      const graph = buildHealthContextGraph(nextIntake)
      setHealthContextGraph(await vitaPilotRepository.saveHealthContextGraph(graph))
      setGraphStatus('generated')
    } catch {
      setGraphStatus('error')
    }

    setSaveState('saved')
  }

  return {
    graphStatus,
    hasGraph: healthContextGraph !== null,
    healthContextGraph,
    intake,
    isLoading,
    saveIntake,
    saveState,
    toggleAnswer,
    updateFreeform,
  }
}
