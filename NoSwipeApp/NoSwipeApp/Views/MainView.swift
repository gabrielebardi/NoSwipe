import SwiftUI

struct MainView: View {
    @State private var isLoggedOut = false
    @State private var needsCalibration = true
    @State private var isCheckingCalibration = true
    
    var body: some View {
        NavigationView {
            if isCheckingCalibration {
                ProgressView("Checking calibration status...")
            } else if needsCalibration {
                CalibrationRequiredView(needsCalibration: $needsCalibration)
            } else {
                MainContentView(isLoggedOut: $isLoggedOut)
            }
        }
        .onAppear {
            checkCalibrationStatus()
        }
        .fullScreenCover(isPresented: $isLoggedOut) {
            LoginView()
        }
    }
    
    func checkCalibrationStatus() {
        NetworkManager.shared.checkCalibrationStatus { result in
            DispatchQueue.main.async {
                self.isCheckingCalibration = false
                switch result {
                case .success(let status):
                    self.needsCalibration = !status.isCalibrated
                case .failure:
                    self.needsCalibration = true
                }
            }
        }
    }
}

struct CalibrationRequiredView: View {
    @Binding var needsCalibration: Bool
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Calibration Required")
                .font(.title)
                .padding()
            
            Text("Before you can start using NoSwipeApp, we need to calibrate your preferences. This helps us provide better matches for you.")
                .multilineTextAlignment(.center)
                .padding()
            
            NavigationLink(destination: PhotoCalibrationView(preferredGender: "Both") { success in
                if success {
                    needsCalibration = false
                }
            }) {
                Text("Start Calibration")
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [.blue, .purple]),
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(8)
            }
            .padding(.horizontal)
        }
    }
}

struct MainContentView: View {
    @Binding var isLoggedOut: Bool
    
    var body: some View {
        TabView {
            MatchesView()
                .tabItem {
                    Image(systemName: "heart.fill")
                    Text("Matches")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.fill")
                    Text("Profile")
                }
        }
        .navigationBarItems(trailing: 
            Button("Logout") {
                KeychainHelper.shared.delete(service: "NoSwipeApp", account: "authToken")
                isLoggedOut = true
            }
        )
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
