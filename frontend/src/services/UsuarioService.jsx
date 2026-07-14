const API_URL = "http://localhost:3000/usuarios";

export async function loginUsuario(email, senha) {
	const response = await fetch(`${API_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ email, senha })
	});

	if (!response.ok) {
		const data = await response.json().catch(() => null);
		throw new Error(data?.erro || "Email ou senha inválidos.");
	}

	return response.json();
}
