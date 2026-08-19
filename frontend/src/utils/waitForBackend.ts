export function waitForBackend(maxAttempts = 30, intervalMs = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        function tryConnect() {
            attempts++;
            fetch('http://localhost:8000/')
                .then((r) => {
                    if (r.ok) {
                        resolve();
                    } else {
                        retryOrFail();
                    }
                })
                .catch(() => {
                    retryOrFail();
                });
        }


        function retryOrFail() {
            if (attempts >= maxAttempts) {
                reject(new Error('Backend did not respond in time.'));
                return;
            }
            setTimeout(tryConnect, intervalMs);
        }

        tryConnect();
    });
}