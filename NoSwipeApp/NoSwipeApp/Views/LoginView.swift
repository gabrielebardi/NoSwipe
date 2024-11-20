//
//  LoginView.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//

import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var isLoggedIn = false
    @State private var token = ""
    @State private var errorMessage = ""
    
    var body: some View {
        VStack {
            Text("Login")
                .font(.largeTitle)
                .padding()
            
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
            
            if !errorMessage.isEmpty {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .padding([.leading, .trailing, .bottom], 10)
            }
            
            Button(action: {
                NetworkManager.shared.login(email: email, password: password) { result in
                    DispatchQueue.main.async {
                        switch result {
                        case .success(let token):
                            self.token = token
                            self.isLoggedIn = true
                            // Save token to Keychain
                            if let tokenData = token.data(using: .utf8) {
                                KeychainHelper.shared.save(tokenData, service: "NoSwipeApp", account: "authToken")
                            }
                            print("Login successful. Token: \(token)")
                        case .failure(let error):
                            self.errorMessage = error.localizedDescription
                            print("Login failed: \(error.localizedDescription)")
                        }
                    }
                }
            }) {
                Text("Login")
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(8)
            }
            .padding([.leading, .trailing], 10)
            
            Spacer()
        }
        .padding()
        .fullScreenCover(isPresented: $isLoggedIn) {
            // Navigate to the main app view after login
            MainView()
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
