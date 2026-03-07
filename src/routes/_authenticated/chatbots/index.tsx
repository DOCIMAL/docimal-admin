import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/chatbots/')({
    component: () => <div>Hello "/_authenticated/chatbots/"!</div>,
})
