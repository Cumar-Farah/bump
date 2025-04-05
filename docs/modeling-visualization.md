# Modeling and Visualization Logic

This document details the technical implementation of data analysis, modeling, and visualization in the BumpData application.

## Data Analysis Architecture

BumpData implements a modular analysis system with the following key components:

### 1. Analysis Techniques

The application supports multiple analysis techniques, organized by category:

**Classification:**
- Random Forest Classifier
- Gradient Boosting Classifier
- Logistic Regression
- Support Vector Classification (SVC)
- Decision Tree Classifier
- Naive Bayes/Gaussian NB

**Regression:**
- Linear Regression
- Ridge Regression
- Lasso Regression
- Support Vector Regression (SVR)
- Gradient Boosting Regressor

**Clustering:**
- K-Means
- DBSCAN
- Hierarchical Clustering
- Isolation Forest

**Dimensionality Reduction:**
- PCA (Principal Component Analysis)
- Kernel PCA

**Time Series:**
- Prophet Forecasting
- Auto ARIMA

Each technique is implemented as a standalone module in the backend with a consistent interface.

### 2. Technique Implementation

Each technique follows a standard structure:

```python
def run(df: pd.DataFrame, params: dict = None):
    """
    Run the analysis technique on the provided DataFrame
    
    Args:
        df: pandas DataFrame with dataset
        params: dictionary of parameters for the technique
        
    Returns:
        Dictionary with analysis results including:
        - predictions
        - model metrics
        - visualizations
        - explanations
    """
```

The implementation generally follows these steps:
1. Extract features (X) and target (y) from dataframe
2. Perform necessary preprocessing
3. Split data into training and testing sets
4. Train the model with specified parameters
5. Generate predictions
6. Calculate performance metrics
7. Create visualization data
8. Provide explanations of results
9. Return structured output

### 3. Technique Selection

Techniques are matched to datasets using the constraints system:

1. **Constraint Definition:**
   Each technique has constraints defined in `constraints.json`:
   - Minimum numeric features required
   - Applicable output types
   - Target column requirements
   - Minimum/maximum rows

2. **Technique Filtering:**
   - The `schemaAnalyzer.ts` utility examines dataset properties
   - The constraints are applied to filter applicable techniques
   - Only suitable techniques are presented to the user

3. **Auto-Running Logic:**
   - The `autoRunner.ts` utility can automatically select and run appropriate techniques
   - Selection is based on target column type and data characteristics
   - Parallel execution is managed for efficiency

## Data Visualization System

BumpData implements a flexible visualization system:

### 1. Visualization Components

The core visualization components include:

**ChartRenderer:**
- Renders various chart types using Recharts
- Adapts to different data structures
- Supports multiple chart types:
  - Bar charts
  - Line charts
  - Scatter plots
  - Pie charts
  - Area charts
  - Combined visualizations

**DataTable:**
- Displays tabular data with pagination
- Supports sorting and filtering
- Handles various data types
- Provides row and column highlighting

**StatsBlock:**
- Presents key statistics and metrics
- Formats numbers appropriately
- Arranges metrics in readable layouts
- Provides interpretation tooltips

**ExplanationBlock:**
- Renders markdown-formatted explanations
- Supports rich text with formatting
- Includes links to additional information
- Breaks down complex concepts

### 2. Visualization Selection Logic

The `variationEngine.ts` utility determines appropriate visualizations:

1. **Chart Type Selection:**
   - Based on data characteristics and result type
   - Categorical vs. numeric data considerations
   - Data volume and distribution analysis
   - Time-series specific handling

2. **Configuration Generation:**
   - Dynamic configuration of axes, colors, and layout
   - Adaptive sizing and responsiveness
   - Data transformation for optimal display
   - Filter and aggregation options

3. **Variation Creation:**
   - Multiple visualization options for the same data
   - Alternative perspectives on results
   - Different levels of detail
   - Complementary chart types

### 3. Result Organization

Results are organized using the `OutputMapContext`:

1. **Categorization:**
   - Results are categorized by type:
     - `chart`: Visual representations
     - `table`: Tabular data
     - `stats`: Statistical metrics
     - `text`: Explanations and interpretations

2. **Filtering:**
   - Users can filter results by category
   - Each category has a count indicator
   - Results can be searched and sorted

3. **Component Mapping:**
   - Each result type is mapped to appropriate rendering components
   - `OutputRenderer` handles this mapping logic

## Advanced Data Processing

### 1. Feature Preprocessing

The `preprocessor.ts` utility handles data preparation:

1. **Data Cleaning:**
   - Missing value handling
   - Outlier detection and treatment
   - Format standardization
   - Error correction

2. **Feature Transformation:**
   - Numeric scaling (standardization, normalization)
   - Categorical encoding (one-hot, label, target)
   - Text vectorization
   - Datetime feature extraction

3. **Data Validation:**
   - Type checking
   - Range validation
   - Consistency verification
   - Error flagging

### 2. Target Analysis

The `targetPlanner.ts` utility analyzes potential target columns:

1. **Task Type Determination:**
   - Classification vs. regression identification
   - Time-series detection
   - Clustering suitability
   - Anomaly detection potential

2. **Target Properties Analysis:**
   - Distribution examination
   - Class balance assessment
   - Range and variance calculation
   - Relationship to features

3. **Technique Matching:**
   - Maps target characteristics to appropriate techniques
   - Suggests parameter configurations
   - Identifies potential challenges
   - Recommends preprocessing steps

## Integration Points

The modeling and visualization systems integrate at several key points:

### 1. Server-Client Communication

1. **API Structure:**
   - `/api/run_model` endpoint executes techniques
   - Parameters passed as JSON
   - Results returned in standardized format
   - Error handling with appropriate status codes

2. **Data Transfer:**
   - Large datasets handled via streaming
   - Progress tracking for long operations
   - Chunked response handling
   - Timeout management

### 2. State Management

1. **Result Tracking:**
   - `upload-context.tsx` tracks running techniques
   - Maps technique IDs to results
   - Maintains loading states
   - Handles error conditions

2. **Output Organization:**
   - `outputMapContext.tsx` categorizes results
   - Provides filtering capabilities
   - Maintains result counts
   - Manages display preferences

## Performance Considerations

### 1. Data Volume Management

1. **Client-Side Data Handling:**
   - Pagination for large datasets
   - Progressive loading
   - Data summarization
   - Filtering and aggregation before visualization

2. **Computation Optimization:**
   - Server-side preprocessing
   - Result caching
   - Incremental calculations
   - Memory-efficient algorithms

### 2. Visualization Performance

1. **Rendering Optimization:**
   - Data downsampling for large datasets
   - Progressive enhancement
   - Deferred rendering
   - Canvas vs. SVG selection

2. **Interactivity:**
   - Throttled event handlers
   - Optimized hover effects
   - Chunked updates
   - Efficient re-rendering

## Extensibility

The system is designed for extensibility:

### 1. Adding New Techniques

To add a new analysis technique:

1. Create a new implementation file in `server/logic/`
2. Implement the standard `run(df, params)` interface
3. Add an entry to `constraints.json`
4. Register the technique in `run_model.py`

### 2. Adding New Visualizations

To add a new visualization type:

1. Extend the `ChartRenderer` component
2. Update `variationEngine.ts` to support the new chart type
3. Add mapping in `OutputRenderer`
4. Update result type categorization in `OutputMapContext`

### 3. Component Customization

Components are designed for customization:

1. Props-based configuration
2. Theme-aware styling
3. Responsive layout adaptation
4. Accessibility considerations built-in
