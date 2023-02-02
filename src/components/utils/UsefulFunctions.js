
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { createTheme, styled, withStyles } from '@mui/material/styles';
import moment from 'moment/moment';

export function getDay(d) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d];
}

export function nextPaymentDayOfWeek(d) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todaysDay = new Date().getDay();

    if (d > todaysDay) {
        return days[d] + " this week.";
    } else if (d == todaysDay){
        return "today";
    } else {
        return days[d] + " next week.";
    }
}

export function dateOrdinal(dd) {
    let d = parseInt(dd);
    return d + (31 == d || 21 == d || 1 == d ? "st" : 22 == d || 2 == d ? "nd" : 23 == d || 3 == d ? "rd" : "th")
};

export function nextPaymentDayOfMonth(d) {
    const todaysDay = new Date().getDate();

    if (d > todaysDay) {
        return `the ${dateOrdinal(d)} of this month.`;
    } else if (d == todaysDay) {
        return "today";
    }
        else {
        return `the ${dateOrdinal(d)} of next month.`;
    }
}

export function prettifyNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export function formatDate(x) {
    const date = new Date(parseInt(x));
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
}


// export function joinedDaysAgo(date1) {
//     let dateParts = date1.split("/");
//     // month is 0-based, that's why we need dataParts[1] - 1
//     let date_1 = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

//     let date_2 = new Date();
//     // time in milliseconds
//     let difference_in_milliseconds = date_2.getTime() - date_1.getTime();
//     let difference_in_days = Math.ceil(difference_in_milliseconds / (1000 * 3600 * 24));
//     if (difference_in_days > 30) {
//         const months = Math.round(difference_in_days / 30);
//         const result = "joined " + months + " ago";
//         return result
//     } else {
//         const result = "joined " + difference_in_days + " days ago";
//         return result
//     }
// }

export function joinedDaysAgo(x) {
    let date_1 = new Date(parseInt(x));

    let date_2 = new Date();
    // time in milliseconds
    let difference_in_milliseconds = date_2.getTime() - date_1.getTime();
    let difference_in_days = Math.ceil(difference_in_milliseconds / (1000 * 3600 * 24));
    if (difference_in_days > 30) {
        const months = Math.round(difference_in_days / 30);
        let result;
        if (months > 1) {
            result = "joined " + months + " months ago";
        } else {
            result = "joined " + months + " month ago";
        }
        return result
    } else {
        const result = "joined " + difference_in_days + " days ago";
        return result
    }
}

export function notToday(x) {
    let date_1 = new Date(parseInt(x));

    let date_2 = new Date();
    // time in milliseconds
    let difference_in_milliseconds = date_2.getTime() - date_1.getTime();
    let difference_in_days = Math.ceil(difference_in_milliseconds / (1000 * 3600 * 24));
    if (difference_in_days > 1) {
        return true;
    } else {
        return false;
    }
}



// mui tablepaginationactions function
export function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}