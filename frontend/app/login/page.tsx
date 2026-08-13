export default function LoginPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
            <iframe
                src="/spider-login/login.html"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'block'
                }}
                title="Spider-Man Login"
            />
        </div>
    );
}
