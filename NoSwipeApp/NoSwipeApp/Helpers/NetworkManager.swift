import Foundation

// MARK: - Response Types
struct LoginResponse: Codable {
    let token: String
}

struct Photo: Codable {
    let id: Int
    let image_url: String
}

struct ServerError: Codable {
    let detail: String
}

struct EmptyResponse: Codable {}

struct CalibrationStatus: Codable {
    let isCalibrated: Bool
}

// MARK: - NetworkError
enum NetworkError: Error {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case statusCode(Int)
    case serverError(message: String)
    case noData
    case decodingFailed
    
    var localizedDescription: String {
        switch self {
        case .invalidURL: return "Invalid URL."
        case .networkError(let error): return "Network error: \(error.localizedDescription)"
        case .invalidResponse: return "Invalid response from server."
        case .statusCode(let code): return "Server responded with status code \(code)."
        case .serverError(let message): return "Server error: \(message)"
        case .noData: return "No data received from server."
        case .decodingFailed: return "Failed to decode server response."
        }
    }
}

// MARK: - NetworkManager
class NetworkManager {
    static let shared = NetworkManager()
    private var isCheckingServers = false
    
    var baseURL: String {
        AppConfig.currentServerURL
    }
    
    private let tokenService = "NoSwipeApp"
    private let tokenAccount = "authToken"
    
    private init() {
        checkAvailableServers()
    }
    
    var authToken: String? {
        return KeychainHelper.shared.readString(service: tokenService, account: tokenAccount)
    }
    
    // MARK: - Server Checking Methods
    func checkAvailableServers() {
        guard !isCheckingServers else { return }
        isCheckingServers = true
        
        // Try each server URL sequentially instead of in parallel
        func tryNextServer(_ index: Int) {
            guard index < AppConfig.serverURLs.count else {
                self.isCheckingServers = false
                return
            }
            
            let serverURL = AppConfig.serverURLs[index]
            checkServer(url: serverURL) { isAvailable in
                if isAvailable {
                    AppConfig.currentServerURL = serverURL
                    self.isCheckingServers = false
                } else {
                    tryNextServer(index + 1)
                }
            }
        }
        
        tryNextServer(0)
    }
    
    private func checkServer(url: String, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: "\(url)/api/health-check/") else {
            completion(false)
            return
        }
        
        let task = URLSession.shared.dataTask(with: url) { _, response, _ in
            if let httpResponse = response as? HTTPURLResponse,
               (200...299).contains(httpResponse.statusCode) {
                print("Successfully connected to server: \(url)")
                completion(true)
            } else {
                print("Failed to connect to server: \(url)")
                completion(false)
            }
        }
        task.resume()
    }
    
    // MARK: - API Methods
    func checkCalibrationStatus(completion: @escaping (Result<CalibrationStatus, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/user/calibration-status/"
        guard let request = makeRequest(url: endpoint, method: "GET") else {
            completion(Result.failure(NetworkError.invalidURL))
            return
        }
        performRequest(request as URLRequest, completion: completion)
    }
    
    func fetchCalibrationPhotos(gender: String, completion: @escaping (Result<[Photo], NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/photos?gender=\(gender)"
        guard let request = makeRequest(url: endpoint, method: "GET") else {
            completion(.failure(.invalidURL))
            return
        }
        performRequest(request, completion: completion)
    }
    
    func submitPhotoRating(photoId: Int, rating: Int, completion: @escaping (Result<Void, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/photos/\(photoId)/rate"
        let body = ["rating": rating]
        
        guard let request = makeRequest(url: endpoint, method: "POST", body: body) else {
            completion(.failure(.invalidURL))
            return
        }
        
        performRequest(request) { (result: Result<EmptyResponse, NetworkError>) in
            completion(result.map { _ in () })
        }
    }
    
    func trainUserModel(userId: String, completion: @escaping (Result<Void, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/train-ai/\(userId)"
        guard let request = makeRequest(url: endpoint, method: "POST") else {
            completion(.failure(.invalidURL))
            return
        }
        
        performRequest(request) { (result: Result<EmptyResponse, NetworkError>) in
            completion(result.map { _ in () })
        }
    }
    
    func fetchProfile(completion: @escaping (Result<UserProfile, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/auth/user/"
        guard let request = makeRequest(url: endpoint, method: "GET") else {
            completion(.failure(.invalidURL))
            return
        }
        performRequest(request, completion: completion)
    }
    
    func updateProfile(username: String, email: String, gender: String, age: Int, location: String, 
                      completion: @escaping (Result<Void, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/auth/user/"
        let body: [String: Any] = [
            "username": username,
            "email": email,
            "gender": gender,
            "age": age,
            "location": location
        ]
        
        guard let request = makeRequest(url: endpoint, method: "PUT", body: body) else {
            completion(.failure(.invalidURL))
            return
        }
        
        performRequest(request) { (result: Result<EmptyResponse, NetworkError>) in
            completion(result.map { _ in () })
        }
    }
    
    // MARK: - Authentication Methods
    func login(email: String, password: String, completion: @escaping (Result<String, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/auth/login/"
        let body = ["email": email, "password": password]
        
        guard let request = makeRequest(url: endpoint, method: "POST", body: body) else {
            completion(.failure(.invalidURL))
            return
        }
        
        performRequest(request) { (result: Result<LoginResponse, NetworkError>) in
            completion(result.map { $0.token })
        }
    }
    
    func register(username: String, email: String, password: String, password2: String,
                 firstName: String, lastName: String, completion: @escaping (Result<Void, NetworkError>) -> Void) {
        let endpoint = "\(baseURL)/api/auth/register/"
        let body: [String: Any] = [
            "username": username,
            "email": email,
            "password": password,
            "password2": password2,
            "first_name": firstName,
            "last_name": lastName
        ]
        
        guard let request = makeRequest(url: endpoint, method: "POST", body: body) else {
            completion(.failure(.invalidURL))
            return
        }
        
        performRequest(request) { (result: Result<EmptyResponse, NetworkError>) in
            completion(result.map { _ in () })
        }
    }
    
    // MARK: - Helper Methods
    private func makeRequest(url: String, method: String, body: [String: Any]? = nil) -> URLRequest? {
        guard let url = URL(string: url) else { return nil }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = authToken {
            request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])
            } catch {
                print("Error encoding request body: \(error.localizedDescription)")
                return nil
            }
        }
        
        return request
    }
    
    private func performRequest<T: Decodable>(_ request: URLRequest, completion: @escaping (Result<T, NetworkError>) -> Void) {
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(.networkError(error)))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(.invalidResponse))
                return
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                if let data = data,
                   let serverError = try? JSONDecoder().decode(ServerError.self, from: data) {
                    completion(.failure(.serverError(message: serverError.detail)))
                } else {
                    completion(.failure(.statusCode(httpResponse.statusCode)))
                }
                return
            }
            
            guard let data = data else {
                completion(.failure(.noData))
                return
            }
            
            do {
                let decodedData = try JSONDecoder().decode(T.self, from: data)
                completion(.success(decodedData))
            } catch {
                completion(.failure(.decodingFailed))
            }
        }
        task.resume()
    }
}
