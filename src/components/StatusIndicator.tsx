interface Props {
    color: string
    testId: string
}

export function StatusIndicator({ color, testId }: Props) {
    return (
        <span
            style={{
                display: 'inline-block',
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                backgroundColor: `${color}55`
            }}
            data-test-id={testId}
        >
            <span
                style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    marginTop: 6,
                    marginLeft: 6,
                    borderRadius: 10,
                    backgroundColor: color
                }}
            ></span>
        </span>
    )
}
