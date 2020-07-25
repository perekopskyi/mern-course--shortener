const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('config');
const router = Router();

// /api/auth/register
router.post(
  '/register',
  // массив middlewares
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      // валидация данных
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации',
        });
      }

      const { email, password } = req.body;

      // проверка на существование пользователя
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res
          .status(400)
          .json({ message: 'Такой пользователь уже существует' });
      }

      // хеширую пароль
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({ email, password: hashedPassword });

      await user.save();

      res.status(201).json({ message: 'Пользователь создан' });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  }
);

// /api/auth/login
router.post(
  '/login',
  // массив middlewares
  [
    check('email', 'Введиет корректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists(),
  ],
  async (req, res) => {
    try {
      // валидация данных
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при входе в систему',
        });
      }

      const { email, password } = req.body;

      // Ищу пользователя в БД
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }

      // Проверяю совпадение пароля
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Неверный пароль, попробуйте снова' });
      }

      // Создаю токен
      const token = jwt.sign({ userId: user.id }, config.get('jwtSecret'), {
        expiresIn: '1h',
      });

      res.json({ token, userId: user.id });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  }
);

module.exports = router;
