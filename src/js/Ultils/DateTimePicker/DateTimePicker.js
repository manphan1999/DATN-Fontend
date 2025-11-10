import {
    DateTimePicker, LocalizationProvider,
    AdapterDayjs, DemoContainer, Stack, Box
} from '../../ImportComponents/Imports';

const CustomDateTimePicker = ({ startDate, endDate, setStartDate, setEndDate }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateTimePicker", "DateTimePicker"]}>
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{ height: "100%", alignItems: "center" }}
                >
                    <Box>
                        <DateTimePicker
                            label="Thời gian bắt đầu"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            format="DD/MM/YYYY HH:mm"
                            sx={{ width: "100%" }}
                        />
                    </Box>
                    <Box>
                        <DateTimePicker
                            label="Thời gian kết thúc"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            format="DD/MM/YYYY HH:mm"
                            sx={{ width: "100%" }}
                        />
                    </Box>
                </Stack>
            </DemoContainer>
        </LocalizationProvider>
    );
};

export default CustomDateTimePicker;