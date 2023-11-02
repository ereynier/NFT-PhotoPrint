interface Props {
    params: {
        id: string
    }
}

export default async function Album({ params }: Props) {

    const { id } = params;

    return (
        <main>
            <div>
                Album {id}
            </div>
        </main>
    )
}