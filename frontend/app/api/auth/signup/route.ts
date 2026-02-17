import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import dbConnect from '../../../db/dbConnect';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, phoneNumber, optionalPhoneNumber, address } = await request.json();

    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Check if phoneNumber already exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      optionalPhoneNumber,
      address: address || [],
    });

    await user.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}