import { useEffect, useState } from 'react'
import { seedLifeIntake, type LifeIntake } from '@vitapilot/core'
import { vitaPilotRepository } from '../lib/repository'

export function useLifeIntake() {
  const [intake, setIntake] = useState<LifeIntake>(seedLifeIntake)
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      vitaPilotRepository
        .getLifeIntake()
        .then(setIntake)
        .finally(() => setIsLoading(false))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const updateFreeform = (freeform: string) => {
    setSaveState('idle')
    setIntake((current) => ({ ...current, freeform }))
  }

  const toggleAnswer = (questionId: string, answer: string, allowMultiple: boolean) => {
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
    setSaveState('saved')
  }

  return {
    intake,
    isLoading,
    saveIntake,
    saveState,
    toggleAnswer,
    updateFreeform,
  }
}
