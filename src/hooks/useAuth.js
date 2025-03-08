import { useDispatch } from 'react-redux'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { setUser, clearUser } from '@/store/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      dispatch(setUser(userCredential.user))
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      dispatch(setUser(userCredential.user))
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      dispatch(clearUser())
    } catch (error) {
      throw error
    }
  }

  return { signup, login, logout }
}