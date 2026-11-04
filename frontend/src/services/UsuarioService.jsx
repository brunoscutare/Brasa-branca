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

export async function registrarUsuario(dados) {
	const response = await fetch(`${API_URL}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(dados)
	});

	const data = await response.json().catch(() => null);
	if (!response.ok) throw new Error(data?.erro || "Não foi possível criar sua conta.");
	return data;
}

export async function listarClientes() {
	const response = await fetch(`${API_URL}/clientes`);
	if (!response.ok) {
		const data = await response.json().catch(() => null);
		throw new Error(data?.erro || "Não foi possível carregar os clientes.");
	}
	return response.json();
}

export async function listarFuncionarios() {
	const response = await fetch(`${API_URL}/funcionarios`);
	if (!response.ok) {
		const data = await response.json().catch(() => null);
		throw new Error(data?.erro || "Não foi possível carregar os funcionários.");
	}
	return response.json();
}

export async function criarFuncionario(dados) {
	const response = await fetch(`${API_URL}/funcionarios`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(dados)
	});
	const data = await response.json().catch(() => null);
	if (!response.ok) throw new Error(data?.erro || "Não foi possível cadastrar o funcionário.");
	return data;
}

export async function atualizarFuncionario(id, dados, usuarioId) {
	const response = await fetch(`${API_URL}/funcionarios/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...dados, usuario_id: usuarioId })
	});
	const data = await response.json().catch(() => null);
	if (!response.ok) throw new Error(data?.erro || "Não foi possível atualizar o funcionário.");
	return data;
}
