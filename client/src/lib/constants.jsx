import { CheckCircle, XCircle, AlertCircle, MousePointer, Pen, Type, Square, Circle, Minus, Eraser } from 'lucide-react'

export const QUESTIONS = [
  "Tell me about yourself and your teaching experience.",
  "How do you explain a concept like fractions to a Grade 4 student who is struggling?",
  "Describe a time when a student didn't understand something despite your best efforts. What did you do?",
  "How do you keep students engaged during online sessions?",
  "What is your approach to handling a student who is losing confidence in mathematics?",
  "How do you personalize your teaching style for different types of learners?",
]

export const TOPIC = 'Fractions & Division'
export const GRADE = '5'

export const COLORS = ['#1A1A1A', '#FFD000', '#EF4444', '#3B82F6', '#22C55E', '#FFFFFF']

export const TOOLS = [
  { id: 'select', icon: <MousePointer size={16} />, label: 'Select' },
  { id: 'pen',    icon: <Pen size={16} />,          label: 'Draw' },
  { id: 'text',   icon: <Type size={16} />,          label: 'Text' },
  { id: 'rect',   icon: <Square size={16} />,        label: 'Rect' },
  { id: 'circle', icon: <Circle size={16} />,        label: 'Circle' },
  { id: 'line',   icon: <Minus size={16} />,         label: 'Line' },
  { id: 'eraser', icon: <Eraser size={16} />,        label: 'Erase' },
]

export const BADGE_STYLES = {
  Advance: 'bg-green-100 text-green-700 border border-green-200',
  Maybe:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Reject:  'bg-red-100 text-red-600 border border-red-200',
}

export const BADGE_ICON = {
  Advance: <CheckCircle size={12} />,
  Maybe:   <AlertCircle size={12} />,
  Reject:  <XCircle size={12} />,
}

export const MOCK_CANDIDATES = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98765 43210',
    date: '20 Apr 2026',
    duration: '11m 24s',
    score: 4.3,
    recommendation: 'Advance',
    dimensions: [
      { name: 'Teaching Ability', score: 4.5, evidence: '"Explained fractions using real-life pizza analogies — highly effective for Grade 5 comprehension."' },
      { name: 'Communication',    score: 4.2, evidence: '"Clear sentence structure, minimal filler words. Engaged effectively with AI student questions."' },
      { name: 'Temperament',      score: 4.4, evidence: '"Remained composed and encouraging when Arjun expressed confusion multiple times."' },
      { name: 'Confidence',       score: 4.1, evidence: '"Strong eye contact maintained throughout. Pace slightly fast during complex explanation."' },
      { name: 'Environment',      score: 4.2, evidence: '"Well-lit, quiet room. Professional background. Minor audio issue in first 30 seconds."' },
    ],
    strengths: [
      'Excellent use of visual analogies for abstract concepts',
      'High student engagement with interactive questioning',
      'Structured lesson flow from concept → example → practice',
      'Positive reinforcement language throughout the session',
    ],
    improvements: [
      'Slow down pace when introducing new formulas',
      'Allow more wait time before answering student questions',
      'Use whiteboard more systematically — organize left to right',
    ],
    transcript: [
      { role: 'AI', text: 'Tell me about your teaching experience.' },
      { role: 'Candidate', text: 'I have been teaching mathematics for 4 years, primarily to Grade 4-7 students. I specialize in making abstract concepts visual and relatable.' },
      { role: 'AI', text: 'How do you explain fractions to a struggling student?' },
      { role: 'Candidate', text: 'I use the pizza analogy — if you have one pizza and cut it into 4 equal pieces, each piece is 1/4. I then relate it to real scenarios they encounter daily.' },
      { role: 'AI', text: 'How do you keep students engaged during online sessions?' },
      { role: 'Candidate', text: 'I use interactive exercises, ask frequent questions, and use the whiteboard actively. I also use Socratic questioning to make students feel part of the discovery process.' },
    ],
  },
  {
    id: '2',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@yahoo.com',
    phone: '+91 87654 32109',
    date: '19 Apr 2026',
    duration: '9m 52s',
    score: 3.1,
    recommendation: 'Maybe',
    dimensions: [
      { name: 'Teaching Ability', score: 3.0, evidence: '"Explanations were technically correct but lacked student-friendly language and relatable examples."' },
      { name: 'Communication',    score: 3.2, evidence: '"Frequent use of mathematical jargon without simplification. Responded well under direct questioning."' },
      { name: 'Temperament',      score: 3.4, evidence: '"Generally calm. Showed slight impatience when AI student repeated a question."' },
      { name: 'Confidence',       score: 3.0, evidence: '"Avoided camera at times. Voice volume inconsistent during teaching demo."' },
      { name: 'Environment',      score: 2.8, evidence: '"Background noise detected. Poor lighting affected visibility. Room setup needs improvement."' },
    ],
    strengths: [
      'Strong subject matter expertise in algebra and geometry',
      'Methodical and structured lesson approach',
    ],
    improvements: [
      'Simplify language for younger students (Grade 4-5)',
      'Improve home setup — lighting and noise levels',
      'Practice maintaining camera eye contact',
      'Use more encouraging language and positive reinforcement',
    ],
    transcript: [
      { role: 'AI', text: 'Tell me about your teaching experience.' },
      { role: 'Candidate', text: 'I have 2 years of experience tutoring high school mathematics, mainly algebra and calculus.' },
      { role: 'AI', text: 'How do you explain fractions to a struggling student?' },
      { role: 'Candidate', text: 'A fraction represents a rational number expressed as p/q where q is not zero. I would start with the definition and then move to examples.' },
      { role: 'AI', text: 'Describe a time when a student struggled despite your best efforts.' },
      { role: 'Candidate', text: 'I had a student who struggled with algebra. I tried different methods but I think the issue was foundational gaps from earlier grades.' },
    ],
  },
  {
    id: '3',
    name: 'Anjali Verma',
    email: 'anjali.verma@gmail.com',
    phone: '+91 76543 21098',
    date: '18 Apr 2026',
    duration: '7m 10s',
    score: 1.9,
    recommendation: 'Reject',
    dimensions: [
      { name: 'Teaching Ability', score: 1.8, evidence: '"Unable to demonstrate concept clearly on whiteboard. Lost student multiple times during explanation."' },
      { name: 'Communication',    score: 2.1, evidence: '"Frequently off-topic. Did not directly answer AI questions. Long pauses throughout."' },
      { name: 'Temperament',      score: 2.0, evidence: '"Appeared visibly nervous throughout. Did not recover well from confusion."' },
      { name: 'Confidence',       score: 1.7, evidence: '"Avoided camera consistently. Voice barely audible in several responses."' },
      { name: 'Environment',      score: 1.9, evidence: '"Significant background noise and distractions. Camera quality very poor."' },
    ],
    strengths: [
      'Shows eagerness to teach and genuine interest in mathematics',
    ],
    improvements: [
      'Practice structured lesson delivery',
      'Work on confidence and voice projection',
      'Set up a dedicated, quiet teaching space',
      'Improve whiteboard organization and writing clarity',
      'Practice answering questions directly without digressions',
    ],
    transcript: [
      { role: 'AI', text: 'Tell me about your teaching experience.' },
      { role: 'Candidate', text: 'Um, I have been trying to... I taught some students before but mostly informally. I like mathematics a lot.' },
      { role: 'AI', text: 'How do you explain fractions to a struggling student?' },
      { role: 'Candidate', text: 'I would... I think I would use... hmm, let me think. I would explain it but I am not sure of the best way exactly.' },
    ],
  },
  {
    id: '4',
    name: 'Vikram Nair',
    email: 'vikram.nair@gmail.com',
    phone: '+91 99887 76655',
    date: '17 Apr 2026',
    duration: '12m 05s',
    score: 4.7,
    recommendation: 'Advance',
    dimensions: [
      { name: 'Teaching Ability', score: 4.8, evidence: '"Exceptional clarity. Used multiple representations — symbolic, verbal, and visual — seamlessly."' },
      { name: 'Communication',    score: 4.7, evidence: '"Articulate, structured, and completely jargon-free. Student comprehension was clear."' },
      { name: 'Temperament',      score: 4.6, evidence: '"Highly patient. Celebrated every small student win with genuine enthusiasm."' },
      { name: 'Confidence',       score: 4.8, evidence: '"Maintained direct camera engagement throughout. Commanding yet warm presence."' },
      { name: 'Environment',      score: 4.6, evidence: '"Dedicated teaching setup, good lighting, whiteboard behind, professional background."' },
    ],
    strengths: [
      'Multi-modal teaching: visual + verbal + symbolic simultaneously',
      'Outstanding patience and student encouragement style',
      'Professional, distraction-free teaching environment',
      'Proactive comprehension checks after every sub-concept',
    ],
    improvements: [
      'Could increase student talk-time ratio slightly',
      'Introduce more open-ended questions',
    ],
    transcript: [
      { role: 'AI', text: 'Tell me about your teaching experience.' },
      { role: 'Candidate', text: 'I have 7 years of experience teaching mathematics from Grade 3 to Grade 10. I have trained over 300 students and have a 96% parent satisfaction score on Cuemath.' },
      { role: 'AI', text: 'How do you explain fractions to a struggling student?' },
      { role: 'Candidate', text: 'I start with physical objects — fold a paper, cut an orange. Then move to drawings, and only after the concept clicks do I write the symbolic form 1/4. The concrete-to-abstract journey is key.' },
      { role: 'AI', text: 'How do you keep students engaged during online sessions?' },
      { role: 'Candidate', text: 'I use a mix of digital whiteboard, voice responses, and quick 1-minute challenges. I never lecture for more than 3 minutes without asking the student to do something active.' },
    ],
  },
  {
    id: '5',
    name: 'Meena Krishnan',
    email: 'meena.k@hotmail.com',
    phone: '+91 88776 65544',
    date: '16 Apr 2026',
    duration: '10m 33s',
    score: 2.6,
    recommendation: 'Maybe',
    dimensions: [
      { name: 'Teaching Ability', score: 2.5, evidence: '"Concepts explained at adult level. Did not adapt language for Grade 5."' },
      { name: 'Communication',    score: 2.8, evidence: '"Some clarity in answers but long monologues without checking student understanding."' },
      { name: 'Temperament',      score: 3.0, evidence: '"Calm demeanor but minimal warmth toward student confusion."' },
      { name: 'Confidence',       score: 2.4, evidence: '"Hesitant when asked about teaching methodology. Looked away frequently."' },
      { name: 'Environment',      score: 2.2, evidence: '"Room was cluttered and loud. Poor microphone quality."' },
    ],
    strengths: [
      'Solid mathematical knowledge base',
      'Generally calm and composed under questioning',
    ],
    improvements: [
      'Adapt teaching language to match student age group',
      'Improve teaching environment (lighting, noise, setup)',
      'Add warmth and encouragement to student interactions',
      'Break explanations into smaller, checkable chunks',
    ],
    transcript: [
      { role: 'AI', text: 'Tell me about your teaching experience.' },
      { role: 'Candidate', text: 'I have a B.Ed and have been tutoring for 3 years, mostly for competitive exam preparation like Olympiads.' },
      { role: 'AI', text: 'How do you explain fractions to a struggling student?' },
      { role: 'Candidate', text: 'Fractions are parts of a whole. The denominator represents the total divisions and the numerator represents the selected parts. I teach the LCM method for operations.' },
    ],
  },
]
