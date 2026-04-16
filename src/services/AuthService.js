import { StorageService } from "./StorageService.js";
import { User } from "../models/User.js";

export class AuthService {
  static register(username, email, password) {
    const trimmedUsername = username?.trim();
    const trimmedEmail = email?.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    const users = StorageService.getUsers();

    if (users.some((u) => u.email === trimmedEmail)) {
      throw new Error("Este email já está registado.");
    }

    if (users.some((u) => u.username === trimmedUsername)) {
      throw new Error("Este nome de utilizador já está em uso.");
    }

    const user = new User({
      username: trimmedUsername,
      email: trimmedEmail,
      password,
    });
    users.push(user.toPlainObject());
    StorageService.saveUsers(users);
    return user;
  }

  static login(email, password) {
    const users = StorageService.getUsers();
    const userData = users.find(
      (u) => u.email === email?.trim() && u.password === password
    );

    if (!userData) {
      throw new Error("Email ou palavra-passe incorretos.");
    }

    return new User(userData);
  }

  static updateUser(user) {
    const users = StorageService.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user instanceof User ? user.toPlainObject() : user;
      StorageService.saveUsers(users);
    }
  }
}
