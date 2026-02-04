interface Props {
    testId: string
}

export function Spinner({ testId }: Props) {
    return <span className="multichain__loader" data-test-id={testId}></span>
}
