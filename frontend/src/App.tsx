import React from 'react'
import { QuestionnaireEditor } from '../../src/components/QuestionnaireEditor'
import { IQuestionnaire } from '../../src/models/Questionnaire'

const emptyQuestionnaire: IQuestionnaire = {
  id: 'demo-1',
  title: 'Demo Questionnaire',
  clientName: 'Demo Client',
  fieldworkMarket: ['Global'],
  comissionMarket: ['Global'],
  language: 'en',
  status: 'Draft',
  createdAt: new Date(),
  createdByUserId: 'demo',
  sections: [
    {
      id: 's1',
      title: 'Section 1',
      questions: [
        {
          id: 'q1',
          type: 'SingleChoice',
          text: 'What is your favorite color?',
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Blue', value: 'blue' }
          ],
          labels: [],
          logic: []
        }
      ]
    }
  ]
}

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Market Research Demo</h1>
      <QuestionnaireEditor questionnaire={emptyQuestionnaire} />
    </div>
  )
}
