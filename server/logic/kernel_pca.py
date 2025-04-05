        import pandas as pd
        import json
        import sys
        from sklearn.decomposition import KernelPCA

        def run(df: pd.DataFrame, params: dict = None):
            try:
                params = params or {}
                kernel = params.get("kernel", "rbf")

                numeric_cols = df.select_dtypes(include='number').columns.tolist()
                if len(numeric_cols) < 2:
                    return {
                        "charts": {},
                        "stats": {"error": "At least 2 numeric columns required"},
                        "tables": {},
                        "explanation": "Kernel PCA requires multiple numeric features to perform projection."
                    }

                X = df[numeric_cols].dropna()
                kpca = KernelPCA(n_components=2, kernel=kernel)
                transformed = kpca.fit_transform(X)

                return {
                    "charts": {
                        "projection_2D": transformed.tolist()
                    },
                    "stats": {},
                    "tables": {},
                    "explanation": f"Kernel PCA reduces dimensionality using a {kernel.upper()} kernel, capturing non-linear patterns in the data."
                }

            except Exception as e:
                return {
                    "charts": {},
                    "stats": {"error": str(e)},
                    "tables": {},
                    "explanation": "An error occurred during Kernel PCA dimensionality reduction."
                }

        if __name__ == "__main__":
            try:
                file_path = sys.argv[1]
                df = pd.read_csv(file_path)
                result = run(df)
                print(json.dumps(result))
            except Exception as e:
                print(json.dumps({"error": str(e)}))
                sys.exit(1)
